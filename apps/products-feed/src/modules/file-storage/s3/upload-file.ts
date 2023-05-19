import { S3Client } from "@aws-sdk/client-s3";
import { UploadMultiPart } from "./upload-multi-part";
import { UploadSinglePart } from "./upload-single-part";

export interface UploadFileArgs {
  s3Client: S3Client;
  fileName: string;
  buffer: Buffer;
  bucketName: string;
}

/*
 * AWS multipart uploads require a minimum file size of 5 MB.
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
 */

const MULTI_PART_SIZE_THRESHOLD = 5 * 1024 * 1024;

export const uploadFile = async (args: UploadFileArgs) => {
  if (args.buffer.length > MULTI_PART_SIZE_THRESHOLD) {
    return await UploadMultiPart(args);
  }
  return await UploadSinglePart(args);
};
