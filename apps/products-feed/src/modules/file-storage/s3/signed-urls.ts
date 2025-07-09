import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class SignedUrls {
  constructor(private client: S3Client) {}

  generateSignedGetObjectUrl(params: {
    bucket: string;
    fileName: string;
    expiresSeconds?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.fileName,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: params.expiresSeconds ?? 30,
    });
  }
}
