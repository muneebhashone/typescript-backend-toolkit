import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { createReadStream, promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
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
 * Cloudflare R2 storage provider implementation
 * R2 is S3-compatible, so we use the same S3Client
 */
export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor() {
    if (!config.R2_ACCOUNT_ID || !config.R2_ACCESS_KEY_ID || !config.R2_SECRET_ACCESS_KEY || !config.R2_BUCKET) {
      throw new StorageError('Missing required R2 configuration');
    }

    // R2 endpoint format: https://<account_id>.r2.cloudflarestorage.com
    const endpoint = `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    this.client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = config.R2_BUCKET;
    this.publicUrl = config.R2_PUBLIC_URL;
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
        provider: 'r2',
        key: params.key,
        size: params.file.size,
        mimetype: params.file.mimetype,
      }, 'File uploaded successfully');

      return { url, key: params.key };
    } catch (err) {
      logger.error({
        provider: 'r2',
        key: params.key,
        err,
      }, 'Failed to upload file');

      throw new StorageError('Failed to upload file to R2', err);
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
        provider: 'r2',
        key,
      }, 'File deleted successfully');
    } catch (err) {
      logger.error({
        provider: 'r2',
        key,
        err,
      }, 'Failed to delete file');

      throw new StorageError('Failed to delete file from R2', err);
    }
  }

  getUrl(key: string): string {
    // Use custom public URL if configured (e.g., custom domain)
    // Otherwise use R2 public bucket URL format
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://${this.bucket}.${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      return !!(this.bucket && config.R2_ACCOUNT_ID && config.R2_ACCESS_KEY_ID && config.R2_SECRET_ACCESS_KEY);
    } catch (err) {
      logger.error({ err }, 'R2 health check failed');
      return false;
    }
  }
}

/**
 * Local file system storage provider implementation
 */
export class LocalStorageProvider implements StorageProvider {
  private storagePath: string;
  private baseUrl?: string;

  constructor() {
    this.storagePath = config.LOCAL_STORAGE_PATH;
    this.baseUrl = config.LOCAL_STORAGE_BASE_URL;
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    try {
      // Ensure storage directory exists
      const targetDir = join(this.storagePath, dirname(params.key));
      await fs.mkdir(targetDir, { recursive: true });

      // Copy file to storage location
      const targetPath = join(this.storagePath, params.key);
      await fs.copyFile(params.file.filepath, targetPath);

      const url = this.getUrl(params.key);

      logger.info({
        provider: 'local',
        key: params.key,
        path: targetPath,
        size: params.file.size,
        mimetype: params.file.mimetype,
      }, 'File uploaded successfully');

      return { url, key: params.key };
    } catch (err) {
      logger.error({
        provider: 'local',
        key: params.key,
        err,
      }, 'Failed to upload file');

      throw new StorageError('Failed to upload file to local storage', err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const targetPath = join(this.storagePath, key);
      await fs.unlink(targetPath);

      logger.info({
        provider: 'local',
        key,
        path: targetPath,
      }, 'File deleted successfully');
    } catch (err) {
      logger.error({
        provider: 'local',
        key,
        err,
      }, 'Failed to delete file');

      throw new StorageError('Failed to delete file from local storage', err);
    }
  }

  getUrl(key: string): string {
    // Use base URL if configured, otherwise return file path
    if (this.baseUrl) {
      return `${this.baseUrl}/${key}`;
    }
    return `/uploads/${key}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if storage directory exists and is writable
      await fs.access(this.storagePath);
      return true;
    } catch {
      // Try to create directory if it doesn't exist
      try {
        await fs.mkdir(this.storagePath, { recursive: true });
        return true;
      } catch (createErr) {
        logger.error({ err: createErr }, 'Local storage health check failed');
        return false;
      }
    }
  }
}

/**
 * Factory function to create the appropriate storage provider
 * Supports S3, Cloudflare R2, and local file system storage
 */
const createStorageProvider = (): StorageProvider => {
  const provider = config.STORAGE_PROVIDER;

  logger.info({ provider }, `Initializing ${provider.toUpperCase()} storage provider`);

  switch (provider) {
    case 's3':
      return new S3StorageProvider();

    case 'r2':
      return new R2StorageProvider();

    case 'local':
      return new LocalStorageProvider();

    default:
      throw new StorageError(`Unsupported storage provider: ${provider}`);
  }
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
