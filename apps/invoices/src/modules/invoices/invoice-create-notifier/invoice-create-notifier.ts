import { Client, gql } from "urql";
import { InvoiceCreateDocument } from "../../../../generated/graphql";
import { logger } from "@saleor/apps-shared";

gql`
  mutation InvoiceCreate($orderId: ID!, $invoiceInput: InvoiceCreateInput!) {
    invoiceCreate(input: $invoiceInput, orderId: $orderId) {
      errors {
        message
      }
      invoice {
        id
      }
    }
  }
`;

export class InvoiceCreateNotifier {
  constructor(private client: Client) {}

  notifyInvoiceCreated(orderId: string, invoiceNumber: string, invoiceUrl: string) {
    logger.info(
      { orderId, invoiceNumber, invoiceUrl },
      "Will notify Saleor with invoiceCreate mutation"
    );

    return this.client
      .mutation(InvoiceCreateDocument, {
        orderId,
        invoiceInput: {
          url: invoiceUrl,
          number: invoiceNumber,
        },
      })
      .toPromise()
      .then((result) => {
        logger.info(result.data, "invoiceCreate finished");

        if (result.error) {
          throw new Error(result.error.message);
        }
      });
  }
}
