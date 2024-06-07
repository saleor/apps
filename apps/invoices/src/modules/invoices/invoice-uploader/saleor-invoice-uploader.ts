import { readFile } from "fs/promises";
import { Client, gql } from "urql";
import { FileUploadMutation } from "../../../../generated/graphql";
import { InvoiceUploader } from "./invoice-uploader";
/**
 * Polyfill file because Node doesn't have it yet
 * https://github.com/nodejs/node/commit/916af4ef2d63fe936a369bcf87ee4f69ec7c67ce
 *
 * Use File instead of Blob so Saleor can understand name
 */
import { File } from "@web-std/file";
import { createLogger } from "../../../logger";

const fileUpload = gql`
  mutation FileUpload($file: Upload!) {
    fileUpload(file: $file) {
      errors {
        message
      }
      uploadedFile {
        url
      }
    }
  }
`;

export class SaleorInvoiceUploader implements InvoiceUploader {
  private logger = createLogger("SaleorInvoiceUploader");

  constructor(private client: Client) {}

  upload(filePath: string, asName: string): Promise<string> {
    this.logger.debug({ filePath, asName }, "Will upload blob to Saleor");

    return readFile(filePath).then((file) => {
      const blob = new File([file], asName, { type: "application/pdf" });

      return this.client
        .mutation<FileUploadMutation>(fileUpload, {
          file: blob,
        })
        .toPromise()
        .then((r) => {
          if (r.data?.fileUpload?.uploadedFile?.url) {
            this.logger.debug({ data: r.data }, "Saleor returned response after uploading blob");

            return r.data.fileUpload.uploadedFile.url;
          } else {
            this.logger.error({ data: r }, "Uploading blob failed");

            throw new Error(r.error?.message);
          }
        });
    });
  }
}
