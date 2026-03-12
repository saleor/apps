import { PutObjectCommand } from "@aws-sdk/client-s3";

import { type UploadFileArgs } from "./upload-file";

export const UploadSinglePart = async ({
  s3Client,
  fileName,
  buffer,
  bucketName,
}: UploadFileArgs) => {
  return await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Body: buffer,
      Key: fileName,
    }),
  );
};
