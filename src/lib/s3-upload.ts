import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import type { FormFile } from '../types';
import s3, { BUCKET_NAME } from './aws.service';

export type S3UploadResult = {
  url: string;
  key: string;
};

/**
 * Uploads a file to S3 and returns the public URL and key
 * @param file - FormFile from formidable multipart parser
 * @param key - S3 object key (path in bucket)
 * @returns Promise with url and key
 */
export const uploadToS3 = async (
  file: FormFile,
  key: string,
): Promise<S3UploadResult> => {
  const fileStream = createReadStream(file.filepath);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype || 'application/octet-stream',
  });

  await s3.send(command);

  // Construct public URL (adjust based on your bucket configuration)
  const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

  return { url, key };
};