import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Remove .optional() from requried schema properties

const configSchema = z.object({
  REDIS_URL: z.string().url(),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  MONGO_DATABASE_URL: z.string().url(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USERNAME: z.string().email().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_FROM: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  CLIENT_SIDE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().regex(/^(\d+d|\d+h|\d+m|\d+s)$/),
  SESSION_EXPIRES_IN: z.string().min(1).transform(Number),
  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().min(1).transform(Number),
  SET_PASSWORD_TOKEN_EXPIRES_IN: z.string().min(1).transform(Number),
  STATIC_OTP: z.enum(['1', '0']).transform(Number).optional(),
  NODE_ENV: z.union([z.literal('production'), z.literal('development')]),
  SET_SESSION: z.string().transform((value) => !!Number(value)),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  APP_NAME: z.string().default('API V1').optional(),
  APP_VERSION: z.string().default('1.0.0').optional(),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);

export default config;
