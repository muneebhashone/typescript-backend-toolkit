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

  MONGO_DATABASE_URL: z.string().url(),

  CLIENT_SIDE_URL: z.string().url(),








  APP_NAME: z.string().default('API V1'),
  APP_VERSION: z.string().default('1.0.0'),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),



  RESPONSE_VALIDATION: z.enum(['strict', 'warn', 'off']).default('strict'),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);

export default config;
