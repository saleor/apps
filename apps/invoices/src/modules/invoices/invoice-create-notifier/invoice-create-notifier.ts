import { Client, gql } from "urql";
import { InvoiceCreateDocument } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";

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
  private logger = createLogger("InvoiceCreateNotifier");
  constructor(private client: Client) {}

  notifyInvoiceCreated(orderId: string, invoiceNumber: string, invoiceUrl: string) {
    this.logger.info(
      { orderId, invoiceNumber, invoiceUrl },
      "Will notify Saleor with invoiceCreate mutation",
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
        this.logger.info(result.data, "invoiceCreate finished");

        if (result.error) {
          throw new Error(result.error.message);
        }
      });
  }
}
