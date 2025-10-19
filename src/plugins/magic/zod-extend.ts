import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import type { FormFile } from '@/types';

extendZodWithOpenApi(z);

/**
 * File validation options for zFile and zFiles
 */
export type FileValidationOptions = {
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed MIME types (e.g., ['image/jpeg', 'image/png']) */
  allowedTypes?: readonly string[] | string[];
};

/**
 * Common MIME type constants for convenience
 */
export const MIME_TYPES = {
  // Images
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',

  // Text
  TEXT: 'text/plain',
  CSV: 'text/csv',
} as const;

/**
 * Common MIME type groups
 */
export const MIME_GROUPS = {
  IMAGES: [MIME_TYPES.JPEG, MIME_TYPES.JPG, MIME_TYPES.PNG, MIME_TYPES.WEBP],
  IMAGES_WITH_GIF: [
    MIME_TYPES.JPEG,
    MIME_TYPES.JPG,
    MIME_TYPES.PNG,
    MIME_TYPES.GIF,
    MIME_TYPES.WEBP,
  ],
  DOCUMENTS: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX],
  SPREADSHEETS: [MIME_TYPES.XLS, MIME_TYPES.XLSX, MIME_TYPES.CSV],
} as const;

/**
 * Convert bytes to human-readable format
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
};

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
 * Validate FormFile against options
 */
const validateFormFile = (
  file: FormFile,
  options?: FileValidationOptions,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if it's a valid FormFile structure
  if (!isFormFile(file)) {
    errors.push('Invalid file structure');
    return { valid: false, errors };
  }

  // Validate file size
  if (options?.maxSize !== undefined && file.size > options.maxSize) {
    errors.push(
      `File size ${formatBytes(file.size)} exceeds maximum allowed size of ${formatBytes(options.maxSize)}`,
    );
  }

  // Validate MIME type
  if (options?.allowedTypes && options.allowedTypes.length > 0) {
    const fileMimeType = file.mimetype?.toLowerCase();
    const allowedTypes = [...options.allowedTypes].map((t) => t.toLowerCase());

    if (!fileMimeType || !allowedTypes.includes(fileMimeType)) {
      errors.push(
        `File type '${file.mimetype || 'unknown'}' is not allowed. Allowed types: ${[...options.allowedTypes].join(', ')}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Helper to describe a single file upload field in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * Validates that the value is a FormFile at runtime.
 *
 * @param options - Optional validation constraints
 * @param options.maxSize - Maximum file size in bytes
 * @param options.allowedTypes - Array of allowed MIME types
 *
 * @example
 * // No validation
 * z.object({ avatar: zFile() })
 *
 * @example
 * // With size and type validation
 * z.object({
 *   avatar: zFile({
 *     maxSize: 5 * 1024 * 1024, // 5MB
 *     allowedTypes: ['image/jpeg', 'image/png']
 *   })
 * })
 *
 * @example
 * // Using MIME type constants
 * z.object({
 *   avatar: zFile({
 *     maxSize: 5 * 1024 * 1024,
 *     allowedTypes: MIME_GROUPS.IMAGES
 *   })
 * })
 */
export const zFile = (options?: FileValidationOptions) =>
  z
    .custom<FormFile>(
      (value) => {
        const validation = validateFormFile(value as FormFile, options);
        return validation.valid;
      },
      (value) => {
        const validation = validateFormFile(value as FormFile, options);
        return {
          message:
            validation.errors.length > 0
              ? `File validation failed: ${validation.errors.join('; ')}`
              : 'Expected a file upload (FormFile)',
        };
      },
    )
    .openapi({ type: 'string', format: 'binary' });

/**
 * Helper to describe multiple file upload fields in OpenAPI spec.
 * For use with multipart/form-data endpoints.
 * Each file in the array is validated individually.
 *
 * @param options - Optional validation constraints applied to each file
 * @param options.maxSize - Maximum file size in bytes per file
 * @param options.allowedTypes - Array of allowed MIME types per file
 *
 * @example
 * // No validation
 * z.object({ images: zFiles() })
 *
 * @example
 * // Each file must be under 2MB and be an image
 * z.object({
 *   images: zFiles({
 *     maxSize: 2 * 1024 * 1024,
 *     allowedTypes: MIME_GROUPS.IMAGES
 *   })
 * })
 */
export const zFiles = (options?: FileValidationOptions) =>
  z
    .array(
      z.custom<FormFile>(
        (value) => {
          const validation = validateFormFile(value as FormFile, options);
          return validation.valid;
        },
        (value) => {
          const validation = validateFormFile(value as FormFile, options);
          return {
            message:
              validation.errors.length > 0
                ? `File validation failed: ${validation.errors.join('; ')}`
                : 'Expected a file upload (FormFile)',
          };
        },
      ),
    )
    .openapi({ type: 'array', items: { type: 'string', format: 'binary' } });
