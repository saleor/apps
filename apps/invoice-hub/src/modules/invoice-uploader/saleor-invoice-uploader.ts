import { InvoiceUploader } from "./invoice-uploader";
import { Client, gql } from "urql";
import { readFile } from "fs/promises";
import { FileUploadMutation } from "../../../generated/graphql";
/**
 * Polyfill file because Node doesnt have it yet
 * https://github.com/nodejs/node/commit/916af4ef2d63fe936a369bcf87ee4f69ec7c67ce
 *
 * Use File instead of Blob so Saleor can understand name
 */
import { File } from "@web-std/file";

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
  constructor(private client: Client) {}

  upload(filePath: string, asName: string): Promise<string> {
    return readFile(filePath).then((file) => {
      const blob = new File([file], asName, { type: "application/pdf" });

      return this.client
        .mutation<FileUploadMutation>(fileUpload, {
          file: blob,
        })
        .toPromise()
        .then((r) => {
          if (r.data?.fileUpload?.uploadedFile?.url) {
            return r.data.fileUpload.uploadedFile.url;
          } else {
            throw new Error(r.error?.message);
          }
        });
    });
  }
}
