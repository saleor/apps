import {
  DeleteObjectCommand,
  GetObjectAttributesCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

interface checkBucketAccessArgs {
  s3Client: S3Client;
  bucketName: string;
}

// Check if client can access the bucket. Throws an error otherwise
export const checkBucketAccess = async ({ s3Client, bucketName }: checkBucketAccessArgs) => {
  const file = "saleor_product_feed_temp/verification_file";

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: file,
    Body: "This is file created for verification. You can remove it",
  });

  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: file,
  });

  const getAttributes = new GetObjectAttributesCommand({
    Bucket: bucketName,
    Key: file,
    ObjectAttributes: ["ObjectParts"],
  });

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: file,
  });

  await s3Client.send(putCommand).catch((e) => {
    throw new Error("Failed to check access, verify PutObject permission", { cause: e });
  });

  await s3Client.send(getAttributes).catch((e) => {
    throw new Error("Failed to check access, verify GetObjectAttributes permission", { cause: e });
  });

  await s3Client.send(getCommand).catch((e) => {
    throw new Error("Failed to check access, verify GetObject permission", { cause: e });
  });

  await s3Client.send(deleteCommand).catch((e) => {
    throw new Error("Failed to check access, verify DeleteObject permission", { cause: e });
  });
};
