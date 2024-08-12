import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';
import { errorResponse } from '../utils/api.utils';
import { sanitizeRecord } from '../utils/common.utils';
import { RequestZodSchemaType } from '../types';

export const validateZodSchema =
  (payload: RequestZodSchemaType) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req: Request<any, any, any, any>, res: Response, next?: NextFunction) => {
    let error: ZodError | null = null;

    Object.entries(payload).forEach((prop) => {
      const [key, value] = prop as [keyof RequestZodSchemaType, ZodSchema];

      const parsed = value.safeParse(req[key]);

      if (!parsed.success) {
        if (error instanceof ZodError) {
          error.addIssues(parsed.error.issues);
        } else {
          error = parsed.error;
        }
      }

      req[key] = sanitizeRecord(parsed.data);
    });

    if (error) {
      return errorResponse(
        res,
        'Invalid input',
        StatusCodes.BAD_REQUEST,
        error,
      );
    } else {
      next?.();
    }
  };
