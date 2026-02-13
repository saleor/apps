import { S3Client } from "@aws-sdk/client-s3";

import { RootConfig } from "../../app-configuration/app-config";

export const createS3ClientFromConfiguration = ({
  accessKeyId,
  secretAccessKey,
  region,
  endpoint,
  forcePathStyle,
}: Exclude<RootConfig["s3"], null>) => {
  return new S3Client({
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
  });
};
