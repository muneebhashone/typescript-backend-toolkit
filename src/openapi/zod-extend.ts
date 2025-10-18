import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { FormFile } from '../types';

extendZodWithOpenApi(z);

/**
 * Type guard to check if a value is a FormFile
 */
export const isFormFile = (value: unknown): value is FormFile => {
  if (!value || typeof value !== 'object') return false;
  const file = value as Record<string, unknown>;
  return (
    typeof file.filepath === 'string' &&
    typeof file.size === 'number' &&
    (file.mimetype === undefined ||
      file.mimetype === null ||
      typeof file.mimetype === 'string') &&
    (file.originalFilename === undefined ||
      file.originalFilename === null ||
      typeof file.originalFilename === 'string')
  );
};

/**
 * Helper to describe a single file upload field in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * Validates that the value is a FormFile at runtime.
 * @example
 * z.object({ avatar: zFile() })
 */
export const zFile = () =>
  z
    .custom<FormFile>(isFormFile, {
      message: 'Expected a file upload (FormFile)',
    })
    .openapi({ type: 'string', format: 'binary' });

/**
 * Helper to describe multiple file upload fields in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * @example
 * z.object({ images: zFiles() })
 */
export const zFiles = () =>
  z
    .array(zFile())
    .openapi({ type: 'array', items: { type: 'string', format: 'binary' } });
