import { S3Client } from '@aws-sdk/client-s3';

export const BUCKET_NAME = 'city-link';

const s3 = new S3Client();

export default s3;
