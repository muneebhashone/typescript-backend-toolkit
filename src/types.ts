import { Request, Response } from 'express';
import { AnyZodObject, ZodEffects, ZodSchema } from 'zod';
import { JwtPayload } from './utils/auth.utils';
import { Server } from 'socket.io';

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
}

export interface ResponseExtended extends Response {
  locals: {
    validateSchema?: ZodSchema;
  };
  jsonValidate: Response['json'];
  sendValidate: Response['send'];
}
