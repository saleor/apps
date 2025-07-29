import { AtobaraiShippingCompanyCode } from "../atobarai/atobarai-shipping-company-code";
import { AtobaraiTransactionId } from "../atobarai/atobarai-transaction-id";

export class TransactionRecord {
  readonly atobaraiTransactionId: AtobaraiTransactionId;
  readonly saleorTrackingNumber: string | null;
  readonly fulfillmentMetadataShippingCompanyCode: AtobaraiShippingCompanyCode | null;

  constructor(args: {
    atobaraiTransactionId: AtobaraiTransactionId;
    saleorTrackingNumber: string | null;
    fulfillmentMetadataShippingCompanyCode: AtobaraiShippingCompanyCode | null;
  }) {
    this.atobaraiTransactionId = args.atobaraiTransactionId;
    this.saleorTrackingNumber = args.saleorTrackingNumber;
    this.fulfillmentMetadataShippingCompanyCode = args.fulfillmentMetadataShippingCompanyCode;
  }

  hasFulfillmentReported(): boolean {
    return this.saleorTrackingNumber !== null;
  }
}
