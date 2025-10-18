import type { NextFunction, Request } from 'express';
import { StatusCodes } from '@/openapi/status-codes';
import config from '@/config/env';
import logger from '@/observability/logger';
import type { ResponseExtended } from '@/types';

type ValidationMode = 'strict' | 'warn' | 'off';

/**
 * Response validation middleware
 *
 * Validates outgoing responses against schemas defined in the route configuration.
 * Also injects ergonomic response helpers (res.ok, res.created, res.noContent).
 *
 * Modes:
 * - strict: Returns 500 error if response doesn't match schema
 * - warn: Logs warning but sends response anyway
 * - off: No validation (helpers still available)
 *
 * Configure via RESPONSE_VALIDATION env var.
 */
export const responseValidator = (
  _req: Request,
  res: ResponseExtended,
  next: NextFunction,
) => {
  const mode: ValidationMode = config.RESPONSE_VALIDATION as ValidationMode;
  const schemas = res.locals.responseSchemas;

  /**
   * Core validation and send logic
   * Validates response body against schema for given status code
   */
  const validateAndSend = (status: number, body: unknown): void => {
    // Skip validation if no schemas configured or validation is off
    if (mode === 'off' || !schemas) {
      res.status(status).json(body);
      return;
    }

    const entry = schemas.get(status);

    // No schema for this status - send as-is
    if (!entry) {
      res.status(status).json(body);
      return;
    }

    // Skip validation for non-JSON content types
    const contentType = entry.contentType || 'application/json';
    if (contentType !== 'application/json') {
      res.status(status).json(body);
      return;
    }

    // Validate response body
    const parsed = entry.schema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.format();

      if (mode === 'strict') {
        logger.error(
          { issues, status, body },
          'Response validation failed - schema mismatch',
        );
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Response validation failed',
          data:
            config.NODE_ENV === 'development'
              ? { issues, originalBody: body }
              : undefined,
        });
        return;
      }

      if (mode === 'warn') {
        logger.warn(
          { issues, status, body },
          'Response validation warning - schema mismatch',
        );
      }
    }

    // Send validated or original body (depending on mode)
    res.status(status).json(parsed.success ? parsed.data : body);
  };

  /**
   * res.ok() - Send 200 OK response
   * @param payload - Response body
   *
   * @example
   * return res.ok({ success: true, data: user });
   */
  res.ok = <T>(payload: T): void => {
    validateAndSend(StatusCodes.OK, payload);
  };

  /**
   * res.created() - Send 201 Created response
   * @param payload - Response body
   *
   * @example
   * return res.created({ success: true, data: newItem });
   */
  res.created = <T>(payload: T): void => {
    validateAndSend(StatusCodes.CREATED, payload);
  };

  /**
   * res.noContent() - Send 204 No Content response
   * Use for successful operations that don't return data
   *
   * @example
   * return res.noContent();
   */
  res.noContent = (): void => {
    // Check if 204 is configured in schemas
    const entry = schemas?.get(StatusCodes.NO_CONTENT);

    if (entry) {
      // Validate empty response if schema exists
      const parsed = entry.schema.safeParse(undefined);

      if (!parsed.success && mode === 'strict') {
        logger.error(
          { issues: parsed.error.format() },
          'Response validation failed for 204 No Content',
        );
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Response validation failed',
        });
        return;
      }
    }

    res.status(StatusCodes.NO_CONTENT).end();
  };

  next();
};
