import type { NextFunction } from 'express';
import { type JwtPayload, verifyToken } from '../utils/auth.utils';
import type { RequestAny, ResponseAny } from '../openapi/magic-router';
import config from '../config/env';

import { createChildLogger } from '../observability/logger';

const logger = createChildLogger({ context: 'extract-jwt' });

export const extractJwt = async (
  req: RequestAny,
  _: ResponseAny,
  next: NextFunction,
) => {
  try {
    logger.debug('Starting JWT extraction');
    const token =
      req.cookies?.accessToken ?? req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.debug('No JWT token found in cookies or headers');
      return next();
    }

    logger.debug(
      { token: token ? '[REDACTED]' : undefined },
      'JWT token found, verifying',
    );
    const decode = await verifyToken<JwtPayload>(token);

    if (config.SET_SESSION && req.app.locals.sessionManager) {
      logger.debug('Session management enabled, validating session');
      const sessionManager = req.app.locals.sessionManager;

      if (!decode.sid) {
        logger.warn('JWT does not contain a session id (sid)');
        return next();
      }

      const validation = await sessionManager.validateSession(
        decode.sid,
        token,
      );

      if (!validation.isValid) {
        logger.warn(
          { sid: decode.sid, reason: validation.reason },
          'Session validation failed',
        );
        return next();
      }

      logger.debug(
        { sid: decode.sid, userId: validation.session?.userId },
        'Session validated successfully',
      );
      req.session = validation.session;
    }

    req.user = decode;
    logger.debug(
      { userId: decode.sub, sid: decode.sid },
      'JWT decoded and user attached to request',
    );

    return next();
  } catch (err) {
    logger.error({ err }, 'Error extracting or verifying JWT');
    return next();
  }
};
