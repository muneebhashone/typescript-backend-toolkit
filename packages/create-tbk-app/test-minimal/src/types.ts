import type { Request, Response } from 'express';
import type { Server } from 'socket.io';
import type { AnyZodObject, ZodEffects, ZodSchema } from 'zod';

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

export type RequestZodSchemaType = {
  params?: ZodObjectWithEffect;
  query?: ZodObjectWithEffect;
  body?: ZodSchema;
};

export interface RequestExtended extends Request {
  io: Server;
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

export interface ResponseExtended<T extends Record<string, unknown> = Record<string, unknown>> extends Response<unknown, ResponseLocals> {
  ok?: (payload: T) => void;
  created?: (payload: T) => void;
  noContent?: () => void;
}

// Extend Express Request globally to include formidable file properties
declare module "express" {
    interface Request {
      file?: FormFile;
      files?: Record<string, FormFile | FormFile[]>;
    }
}
