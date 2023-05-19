import { S3Client } from "@aws-sdk/client-s3";
import { S3BucketConfiguration } from "../../app-configuration/app-config";

export const createS3ClientFromConfiguration = ({
  accessKeyId,
  secretAccessKey,
  region,
}: S3BucketConfiguration) => {
  return new S3Client({
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
  });
};
