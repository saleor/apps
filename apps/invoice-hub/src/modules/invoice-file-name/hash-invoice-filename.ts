import { randomUUID } from "crypto";

export const hashInvoiceFilename = (invoiceName: string, orderId: string) => {
  return `${invoiceName}_${orderId}_${randomUUID()}`;
};
