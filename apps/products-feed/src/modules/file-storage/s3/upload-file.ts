import { S3Client } from "@aws-sdk/client-s3";

import { MULTI_PART_SIZE_THRESHOLD } from "./const";
import { UploadMultiPart } from "./upload-multi-part";
import { UploadSinglePart } from "./upload-single-part";

export interface UploadFileArgs {
  s3Client: S3Client;
  fileName: string;
  buffer: Buffer;
  bucketName: string;
}

export const uploadFile = async (args: UploadFileArgs) => {
  if (args.buffer.length > MULTI_PART_SIZE_THRESHOLD) {
    return await UploadMultiPart(args);
  }
  return await UploadSinglePart(args);
};
