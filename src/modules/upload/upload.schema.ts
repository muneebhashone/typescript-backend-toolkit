import { z } from 'zod';
import { zFile, zFiles, MIME_GROUPS } from '@/plugins/magic/zod-extend';
import { R } from '@/plugins/magic/response.builders';

export const uploadSchema = z.object({
  avatar: zFile({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: MIME_GROUPS.IMAGES,
  }),
  multipleFiles: zFiles({
    maxSize: 2 * 1024 * 1024, // 2MB per file
    allowedTypes: MIME_GROUPS.IMAGES,
  }).optional(),
});

export const uploadResponseSchema = R.success(
  z.object({
    key: zFile(),
    multipleFiles: zFiles().optional(),
  }),
);

export type UploadSchema = z.infer<typeof uploadSchema>;
export type UploadResponseSchema = z.infer<typeof uploadResponseSchema>;
