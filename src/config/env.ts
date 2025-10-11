import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const booleanString = z
  .string()
  .transform((value) => value === 'true' || value === '1')
  .pipe(z.boolean());

const configSchema = z.object({
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),

  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),

  REDIS_URL: z.string().url(),
  MONGO_DATABASE_URL: z.string().url(),

  CLIENT_SIDE_URL: z.string().url(),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('86400').transform(Number),
  SESSION_EXPIRES_IN: z.string().default('86400').transform(Number),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z
    .string()
    .default('86400')
    .transform(Number),
  SET_PASSWORD_TOKEN_EXPIRES_IN: z.string().default('86400').transform(Number),
  SET_SESSION: booleanString.default('true'),

  SESSION_DRIVER: z.enum(['mongo', 'redis']).default('mongo'),
  SESSION_MAX_PER_USER: z.string().transform(Number).default('5'),
  SESSION_IDLE_TTL: z.string().transform(Number).optional(),
  SESSION_ABSOLUTE_TTL: z.string().transform(Number).optional(),
  SESSION_ROTATION: booleanString.default('false'),
  SESSION_COOKIE_NAME: z.string().default('session_id'),
  SESSION_DEBUG: booleanString.default('false'),
  SESSION_CLEANUP_ENABLED: booleanString.default('true'),
  SESSION_CLEANUP_CRON: z.string().default('0 * * * *'),

  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USERNAME: z.string().email().optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),

  MAILGUN_API_KEY: z.string().min(1),
  MAILGUN_DOMAIN: z.string().min(1),
  MAILGUN_FROM_EMAIL: z.string().email(),

  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1),

  OTP_VERIFICATION_ENABLED: booleanString,
  STATIC_OTP: z.enum(['1', '0']).transform(Number).optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  APP_NAME: z.string().default('API V1'),
  APP_VERSION: z.string().default('1.0.0'),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),
  METRICS_ENABLED: booleanString.default('true'),
  HEALTH_ENABLED: booleanString.default('true'),

  CORS_ENABLED: booleanString.default('true'),
  RATE_LIMIT_ENABLED: booleanString.default('false'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  TRUST_PROXY: booleanString.default('false'),
  HTTPS_ENABLED: booleanString.default('false'),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);

export default config;
