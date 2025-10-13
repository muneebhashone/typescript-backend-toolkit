import type { Request, Response } from 'express';
import type { Server } from 'socket.io';
import type { AnyZodObject, ZodEffects, ZodSchema } from 'zod';
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

export interface ResponseExtended extends Response {}
