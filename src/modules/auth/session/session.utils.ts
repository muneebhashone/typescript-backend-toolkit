import crypto from 'node:crypto';
import type { CookieOptions } from 'express';
import config from '../../../config/env';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function buildSessionCookieOptions(): CookieOptions {
  const isProduction = config.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction || config.HTTPS_ENABLED,
    sameSite: 'lax',
    maxAge: config.SESSION_EXPIRES_IN * 1000,
    path: '/',
  };
}

export function extractMetadataFromRequest(req: {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  connection?: { remoteAddress?: string };
}): {
  userAgent?: string;
  ipAddress?: string;
} {
  const userAgent = req.headers?.['user-agent'];
  const xForwardedFor = req.headers?.['x-forwarded-for'];
  
  return {
    userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
    ipAddress: req.ip || (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) || req.connection?.remoteAddress,
  };
}

export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function calculateExpiresAt(expiresIn?: number): Date {
  const ttl = expiresIn || config.SESSION_EXPIRES_IN;
  return new Date(Date.now() + ttl * 1000);
}
