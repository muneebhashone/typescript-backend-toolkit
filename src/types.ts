import type { Request, Response } from 'express';
import type { Server } from 'socket.io';
import type { AnyZodObject, ZodEffects, ZodSchema, ZodTypeAny } from 'zod';
import type { JwtPayload } from './utils/auth.utils';
import { SessionRecord } from './modules/auth/session/session.types';

export type ZodObjectWithEffect =
  | AnyZodObject
  | ZodEffects<ZodObjectWithEffect, unknown, unknown>;

/**
 * Represents a file parsed by formidable from multipart/form-data requests.
 * Used for type-safe file handling in controllers.
 */
export type FormFile = {
  /** Absolute path to the temporary file on disk */
  filepath: string;
  /** Original filename from the client */
  originalFilename?: string | null;
  /** MIME type of the file */
  mimetype?: string | null;
  /** File size in bytes */
  size: number;
  /** Hash of the file content (if enabled in formidable options) */
  hash?: string | null;
  /** Last modified date of the file */
  lastModifiedDate?: Date | null;
};

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
  file?: FormFile;
  files?: Record<string, FormFile | FormFile[]>;
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

// Extend Express Request globally to include formidable file properties
declare global {
  namespace Express {
    interface Request {
      file?: FormFile;
      files?: Record<string, FormFile | FormFile[]>;
    }
  }
}
