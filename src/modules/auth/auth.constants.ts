import { CookieOptions } from 'express';
import config from '../../config/config.service';

const clientSideUrl = new URL(config.CLIENT_SIDE_URL);

export const AUTH_COOKIE_KEY = 'accessToken';

export const COOKIE_CONFIG: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.NODE_ENV === 'production' ? true : false,
  maxAge: config.SESSION_EXPIRES_IN,
  domain: clientSideUrl.hostname,
};
