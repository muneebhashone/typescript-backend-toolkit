import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET_NAME = "your-bucket-name";

const s3 = new S3Client();

export default s3;
