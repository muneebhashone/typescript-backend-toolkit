import { S3Client } from '@aws-sdk/client-s3';
import config from '../config/env';

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

const s3 = new S3Client(s3Config);

export default s3;
export const BUCKET_NAME = config.AWS_S3_BUCKET;
