import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'node:fs';
import config from '../config/env';
import logger from '../observability/logger';
import type { FormFile } from '../types';
import { StorageError } from './errors';

/**
 * Upload parameters
 */
export type UploadParams = {
  file: FormFile;
  key: string;
};

/**
 * Upload result
 */
export type UploadResult = {
  url: string;
  key: string;
};

/**
 * Abstract storage provider interface
 */
export interface StorageProvider {
  upload(params: UploadParams): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  healthCheck(): Promise<boolean>;
}

/**
 * S3 storage provider implementation
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const s3Config: {
      region: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
    } = {
      region: config.AWS_REGION,
    };

    // Only set explicit credentials if provided in env
    if (config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY) {
      s3Config.credentials = {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.client = new S3Client(s3Config);
    this.bucket = config.AWS_S3_BUCKET;
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    try {
      const fileStream = createReadStream(params.file.filepath);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: fileStream,
        ContentType: params.file.mimetype || 'application/octet-stream',
      });

      await this.client.send(command);

      const url = this.getUrl(params.key);

      logger.info({
        provider: 's3',
        key: params.key,
        size: params.file.size,
        mimetype: params.file.mimetype,
      }, 'File uploaded successfully');

      return { url, key: params.key };
    } catch (err) {
      logger.error({
        provider: 's3',
        key: params.key,
        err,
      }, 'Failed to upload file');

      throw new StorageError('Failed to upload file to S3', err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);

      logger.info({
        provider: 's3',
        key,
      }, 'File deleted successfully');
    } catch (err) {
      logger.error({
        provider: 's3',
        key,
        err,
      }, 'Failed to delete file');

      throw new StorageError('Failed to delete file from S3', err);
    }
  }

  getUrl(key: string): string {
    // Construct public URL (adjust based on your bucket configuration)
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple check: verify credentials and bucket are configured
      return !!(this.bucket && config.AWS_REGION);
    } catch (err) {
      logger.error({ err }, 'S3 health check failed');
      return false;
    }
  }
}

/**
 * Factory function to create the appropriate storage provider
 * Currently only S3 is supported, but ready for future providers (Cloudflare R2, local, etc.)
 */
const createStorageProvider = (): StorageProvider => {
  logger.info('Using S3 storage provider');
  return new S3StorageProvider();
};

/**
 * Auto-initialized storage provider singleton
 */
export const storageProvider = createStorageProvider();

/**
 * Convenience function to upload a file
 */
export const uploadFile = async (params: UploadParams): Promise<UploadResult> => {
  return storageProvider.upload(params);
};

/**
 * Convenience function to delete a file
 */
export const deleteFile = async (key: string): Promise<void> => {
  return storageProvider.delete(key);
};

/**
 * Convenience function to get file URL
 */
export const getFileUrl = (key: string): string => {
  return storageProvider.getUrl(key);
};

/**
 * Health check function for storage service
 * Returns a function compatible with HealthCheck interface
 */
export const checkStorageHealth = () => {
  return async (): Promise<boolean> => {
    try {
      return await storageProvider.healthCheck();
    } catch (err) {
      logger.error({ err }, 'Storage health check failed');
      return false;
    }
  };
};
