import { z } from 'zod';

export const sessionMetadataSchema = z.object({
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
});

export const createSessionSchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
  metadata: sessionMetadataSchema.optional(),
  expiresIn: z.number().positive().optional(),
});

export const sessionRecordSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  tokenHash: z.string(),
  metadata: sessionMetadataSchema.optional(),
  createdAt: z.date(),
  lastSeen: z.date(),
  expiresAt: z.date(),
  isRevoked: z.boolean().optional(),
});

export const sessionStoreConfigSchema = z.object({
  driver: z.enum(['mongo', 'redis']),
  maxPerUser: z.number().positive().default(5),
  idleTTL: z.number().positive().optional(),
  absoluteTTL: z.number().positive().optional(),
  rotation: z.boolean().default(false),
  debug: z.boolean().default(false),
});

export const sessionPluginOptionsSchema = z.object({
  enabled: z.boolean().default(true),
  driver: z.enum(['mongo', 'redis']).optional(),
  maxPerUser: z.number().positive().optional(),
  idleTTL: z.number().positive().optional(),
  absoluteTTL: z.number().positive().optional(),
  rotation: z.boolean().optional(),
  debug: z.boolean().optional(),
});

export type SessionMetadataSchemaType = z.infer<typeof sessionMetadataSchema>;
export type CreateSessionSchemaType = z.infer<typeof createSessionSchema>;
export type SessionRecordSchemaType = z.infer<typeof sessionRecordSchema>;
export type SessionStoreConfigSchemaType = z.infer<typeof sessionStoreConfigSchema>;
export type SessionPluginOptionsSchemaType = z.infer<typeof sessionPluginOptionsSchema>;
