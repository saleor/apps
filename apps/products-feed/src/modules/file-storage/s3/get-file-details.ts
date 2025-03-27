import { GetObjectAttributesCommand, S3Client } from "@aws-sdk/client-s3";

export interface GetFileDetailsArgs {
  s3Client: S3Client;
  fileName: string;
  bucketName: string;
}

export const getFileDetails = async ({ s3Client, bucketName, fileName }: GetFileDetailsArgs) => {
  return await s3Client.send(
    new GetObjectAttributesCommand({
      Bucket: bucketName,
      Key: fileName,
      ObjectAttributes: ["ObjectParts"],
    }),
  );
};
