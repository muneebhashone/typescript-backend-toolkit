import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import config from '@/config/env';
import logger from '@/plugins/observability/logger';

interface QueueSessionPayload {
  sub: string; // username
  iat: number; // issued at (unix timestamp)
  exp: number; // expires at (unix timestamp)
}

export function signQueueSession(username: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: QueueSessionPayload = {
    sub: username,
    iat: now,
    exp: now + config.QUEUE_SESSION_TTL,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(Buffer.from(payloadJson, 'utf8'));

  const hmac = crypto
    .createHmac('sha256', config.QUEUE_SESSION_SECRET)
    .update(payloadB64)
    .digest();
  const signature = base64UrlEncode(hmac);

  return `${payloadB64}.${signature}`;
}

export function verifyQueueSession(token: string): QueueSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;

    const expectedHmac = crypto
      .createHmac('sha256', config.QUEUE_SESSION_SECRET)
      .update(payloadB64)
      .digest();
    const expectedSignature = base64UrlEncode(expectedHmac);

    if (!timingSafeEqual(signature, expectedSignature)) return null;

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as QueueSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

export function setQueueCookie(res: Response, token: string): void {
  const isSecure = config.NODE_ENV === 'production' && config.HTTPS_ENABLED;
  res.cookie(config.QUEUE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: config.QUEUE_SESSION_TTL * 1000,
    path: '/',
  });
}

export function clearQueueCookie(res: Response): void {
  res.clearCookie(config.QUEUE_COOKIE_NAME, { path: '/' });
}

export function compareQueueCredentials(username: string, password: string): boolean {
  const validUsername = config.QUEUE_USERNAME;
  const validPassword = config.QUEUE_PANEL_PASSWORD;

  const usernameMatch = timingSafeEqual(username, validUsername);
  const passwordMatch = timingSafeEqual(password, validPassword);

  return usernameMatch && passwordMatch;
}

export function queueAuthGuardApi(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.QUEUE_AUTH_ENABLED) {
    return next();
  }

  const token = req.cookies?.[config.QUEUE_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const payload = verifyQueueSession(token);
  if (!payload) {
    clearQueueCookie(res);
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  (req as any).queueUser = payload.sub;
  next();
}

export const queueAuthGuardUI = (basePath: string = '/queues') => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!config.QUEUE_AUTH_ENABLED) {
    return next();
  }

  const token = req.cookies?.[config.QUEUE_COOKIE_NAME];
  if (!token) {
    const nextUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`${basePath}/login?next=${nextUrl}`);
    return;
  }

  const payload = verifyQueueSession(token);
  if (!payload) {
    clearQueueCookie(res);
    const nextUrl = encodeURIComponent(req.originalUrl);
    res.redirect(`${basePath}/login?next=${nextUrl}`);
    return;
  }

  (req as any).queueUser = payload.sub;
  next();
};

export const queueAuthGuardAdaptive = (basePath: string = '/queues') => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!config.QUEUE_AUTH_ENABLED) {
    return next();
  }

  const token = req.cookies?.[config.QUEUE_COOKIE_NAME];
  const payload = token && verifyQueueSession(token);
  if (payload) {
    (req as any).queueUser = payload.sub;
    return next();
  }

  clearQueueCookie(res);
  const wantsJson = req.headers.accept?.includes('application/json');
  if (wantsJson) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const nextUrl = encodeURIComponent(req.originalUrl);
  return res.redirect(`${basePath}/login?next=${nextUrl}`);
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;

export function checkQueueLoginRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    logger.warn(
      { identifier, attempts: entry.count },
      'Queue login rate limit exceeded',
    );
    return false;
  }

  entry.count += 1;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}


