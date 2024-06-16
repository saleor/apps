import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { UploadFileArgs } from "./upload-file";
import { MULTI_PART_SIZE_THRESHOLD } from "./const";
import { createLogger } from "../../../logger";

/*
 * Code based on S3 docs:
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
 */

const logger = createLogger("UploadMultiPart");

export const UploadMultiPart = async ({
  s3Client,
  fileName,
  buffer,
  bucketName,
}: UploadFileArgs) => {
  let uploadId;

  logger.trace("Uploading file", { fileName, bucketName });

  try {
    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
      }),
    );

    uploadId = multipartUpload.UploadId;

    logger.trace(`Multipart upload ID: ${uploadId}`);

    const uploadPromises = [];
    // Multipart uploads require a minimum size of 5 MB per part.
    const partSize = MULTI_PART_SIZE_THRESHOLD;
    const numberOfParts = Math.ceil(buffer.length / partSize);

    // Upload each part.
    for (let i = 0; i < numberOfParts; i++) {
      const start = i * partSize;
      const end = start + partSize;

      uploadPromises.push(
        s3Client
          .send(
            new UploadPartCommand({
              Bucket: bucketName,
              Key: fileName,
              UploadId: uploadId,
              Body: buffer.subarray(start, end),
              PartNumber: i + 1,
            }),
          )
          .then((d) => {
            logger.trace(`Part ${i + 1}/${numberOfParts} uploaded`);
            return d;
          }),
      );
    }

    const uploadResults = await Promise.all(uploadPromises);

    const completeCommand = await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: uploadResults.map(({ ETag }, i) => ({
            ETag,
            PartNumber: i + 1,
          })),
        },
      }),
    );

    logger.debug("Multipart upload completed");

    return completeCommand;
  } catch (err) {
    logger.error("Error during the S3 upload", { error: err });

    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
      });

      await s3Client.send(abortCommand);
    }
  }
};
