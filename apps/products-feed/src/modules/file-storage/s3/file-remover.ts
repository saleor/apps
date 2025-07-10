import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectsCommandInput } from "@aws-sdk/client-s3/dist-types/commands/DeleteObjectsCommand";

export class FileRemover {
  constructor(private s3Client: S3Client) {}

  async removeFilesBulk(fileNames: string[], bucket: string) {
    if (!fileNames.length) return;

    const deleteParams: DeleteObjectsCommandInput = {
      Bucket: bucket,
      Delete: {
        Objects: fileNames.map((Key) => ({ Key })),
        Quiet: false,
      },
    };

    await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
  }
}
