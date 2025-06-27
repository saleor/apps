import { S3Client } from "@aws-sdk/client-s3";

import { RootConfig } from "../../app-configuration/app-config";

export const createS3ClientFromConfiguration = ({
  accessKeyId,
  secretAccessKey,
  region,
}: Exclude<RootConfig["s3"], null>) => {
  return new S3Client({
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
    forcePathStyle: true,
  });
};
