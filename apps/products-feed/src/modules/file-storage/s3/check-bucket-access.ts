import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

interface checkBucketAccessArgs {
  s3Client: S3Client;
  bucketName: string;
}

// Check if client can access the bucket. Throws an error otherwise
export const checkBucketAccess = async ({ s3Client, bucketName }: checkBucketAccessArgs) => {
  await s3Client.send(
    new HeadBucketCommand({
      Bucket: bucketName,
    })
  );
};
