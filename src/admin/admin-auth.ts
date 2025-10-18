import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import config from '../config/env';
import logger from '../observability/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AdminSessionPayload {
  sub: string; // username
  iat: number; // issued at (unix timestamp)
  exp: number; // expires at (unix timestamp)
}

// ─────────────────────────────────────────────────────────────────────────────
// Token signing and verification (HMAC-based)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign an admin session token using HMAC-SHA256.
 * Format: base64url(JSON payload) + '.' + base64url(HMAC)
 */
export function signAdminSession(username: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: username,
    iat: now,
    exp: now + config.ADMIN_SESSION_TTL,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(Buffer.from(payloadJson, 'utf8'));

  const hmac = crypto
    .createHmac('sha256', config.ADMIN_SESSION_SECRET)
    .update(payloadB64)
    .digest();
  const signature = base64UrlEncode(hmac);

  return `${payloadB64}.${signature}`;
}

/**
 * Verify an admin session token and return the payload if valid.
 * Returns null if invalid or expired.
 */
export function verifyAdminSession(
  token: string,
): AdminSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;

    // Verify signature
    const expectedHmac = crypto
      .createHmac('sha256', config.ADMIN_SESSION_SECRET)
      .update(payloadB64)
      .digest();
    const expectedSignature = base64UrlEncode(expectedHmac);

    if (!timingSafeEqual(signature, expectedSignature)) return null;

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as AdminSessionPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookie helpers
// ─────────────────────────────────────────────────────────────────────────────

export function setAdminCookie(res: Response, token: string): void {
  const isSecure = config.NODE_ENV === 'production' && config.HTTPS_ENABLED;
  res.cookie(config.ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: config.ADMIN_SESSION_TTL * 1000,
    path: '/',
  });
}

export function clearAdminCookie(res: Response): void {
  res.clearCookie(config.ADMIN_COOKIE_NAME, { path: '/' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Credential verification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compare provided credentials against environment variables.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function compareCredentials(
  username: string,
  password: string,
): boolean {
  const validUsername = config.ADMIN_USERNAME;
  const validPassword = config.ADMIN_PANEL_PASSWORD;

  const usernameMatch = timingSafeEqual(username, validUsername);
  const passwordMatch = timingSafeEqual(password, validPassword);

  return usernameMatch && passwordMatch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware guards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guard for admin API routes (/admin/api/*).
 * Returns 401 JSON if unauthorized.
 */
export function adminAuthGuardApi(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.ADMIN_AUTH_ENABLED) {
    return next();
  }

  const token = req.cookies?.[config.ADMIN_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const payload = verifyAdminSession(token);
  if (!payload) {
    clearAdminCookie(res);
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  // Attach admin user to request for logging/audit
  (req as any).adminUser = payload.sub;
  next();
}

/**
 * Guard for admin UI routes (/admin).
 * Redirects to /admin/login if unauthorized.
 */
export function adminAuthGuardUI(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.ADMIN_AUTH_ENABLED) {
    return next();
  }

  const token = req.cookies?.[config.ADMIN_COOKIE_NAME];
  if (!token) {
    const nextUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`/admin/login?next=${nextUrl}`);
    return;
  }

  const payload = verifyAdminSession(token);
  if (!payload) {
    clearAdminCookie(res);
    const nextUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`/admin/login?next=${nextUrl}`);
    return;
  }

  // Attach admin user to request
  (req as any).adminUser = payload.sub;
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting (in-memory, simple)
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;

/**
 * Simple in-memory rate limiter for admin login.
 * Returns true if request should be allowed, false if rate limited.
 */
export function checkAdminLoginRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    logger.warn(
      { identifier, attempts: entry.count },
      'Admin login rate limit exceeded',
    );
    return false;
  }

  entry.count += 1;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Every minute

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    // Still compare to prevent early exit timing leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
