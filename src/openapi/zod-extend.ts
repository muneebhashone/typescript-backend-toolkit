import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
extendZodWithOpenApi(z);

/**
 * Helper to describe a single file upload field in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * @example
 * z.object({ avatar: zFile() })
 */
export const zFile = () =>
  z.any().openapi({ type: 'string', format: 'binary' });

/**
 * Helper to describe multiple file upload fields in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * @example
 * z.object({ images: zFiles() })
 */
export const zFiles = () =>
  z
    .array(z.any())
    .openapi({ type: 'array', items: { type: 'string', format: 'binary' } });
