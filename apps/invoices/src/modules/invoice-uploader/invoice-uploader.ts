export interface InvoiceUploader {
  upload(filePath: string, asName: string): Promise<string>;
}
