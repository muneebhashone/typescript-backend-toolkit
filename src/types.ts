import type { Request, Response } from 'express';
import type { Server } from 'socket.io';
import type { AnyZodObject, ZodEffects, ZodSchema, ZodTypeAny } from 'zod';
import type { JwtPayload } from './utils/auth.utils';
import { SessionRecord } from './modules/auth/session/session.types';

export type ZodObjectWithEffect =
  | AnyZodObject
  | ZodEffects<ZodObjectWithEffect, unknown, unknown>;

export interface GoogleCallbackQuery {
  code: string;
  error?: string;
}

export type RequestZodSchemaType = {
  params?: ZodObjectWithEffect;
  query?: ZodObjectWithEffect;
  body?: ZodSchema;
};

export interface RequestExtended extends Request {
  user: JwtPayload;
  io: Server;
  session?: SessionRecord;
}

export type ResponseSchemaEntry = {
  schema: ZodSchema;
  contentType?: string;
  description?: string;
};

export interface ResponseLocals extends Record<string, unknown> {
  validateSchema?: ZodSchema;
  responseSchemas?: Map<number, ResponseSchemaEntry>;
}

export interface ResponseExtended extends Response<unknown, ResponseLocals> {
  ok?: <T>(payload: T) => void;
  created?: <T>(payload: T) => void;
  noContent?: () => void;
}

// Utility type for strongly typed responses in controllers
export type TypedResponse<TResponses extends Record<number, ZodTypeAny>> =
  ResponseExtended & {
    ok: (
      payload: TResponses[200] extends ZodTypeAny
        ? import('zod').z.infer<TResponses[200]>
        : unknown,
    ) => void;
    created: (
      payload: TResponses[201] extends ZodTypeAny
        ? import('zod').z.infer<TResponses[201]>
        : unknown,
    ) => void;
    noContent: () => void;
  };
