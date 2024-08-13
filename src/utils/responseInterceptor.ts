import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ExtendedResponse extends Response {
  locals: { validateSchema?: ZodSchema };
}

const responseInterceptor = (
  _: Request,
  res: ExtendedResponse,
  next: NextFunction,
) => {
  const originalJson = res.json;
  const originalSend = res.send;
  const validateSchema = res.locals.validateSchema ?? null;

  res.json = function (body) {
    if (validateSchema) {
      try {
        validateSchema.parse(body);
      } catch (err) {
        if (err instanceof ZodError) {
          return originalJson.call(this, {
            success: false,
            message: 'Response Validation Error - Server Error',
            data: err.errors,
            stack: err.stack,
          });
        }
      }
    }

    return originalJson.call(this, body);
  };

  res.send = function (body) {
    if (validateSchema) {
      try {
        validateSchema.parse(body);
      } catch (err) {
        if (err instanceof ZodError) {
          return originalSend.call(this, {
            success: false,
            message: 'Response Validation Error - Server Error',
            data: err.errors,
            stack: err.stack,
          });
        }
      }
    }

    return originalSend.call(this, body);
  };

  next();
};

export default responseInterceptor;
