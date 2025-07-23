import { AtobaraiTransactionId } from "../atobarai/atobarai-transaction-id";

export class TransactionRecord {
  readonly atobaraiTransactionId: AtobaraiTransactionId;
  readonly saleorTrackingNumber: string | null;

  constructor(args: {
    atobaraiTransactionId: AtobaraiTransactionId;
    saleorTrackingNumber: string | null;
  }) {
    this.atobaraiTransactionId = args.atobaraiTransactionId;
    this.saleorTrackingNumber = args.saleorTrackingNumber;
  }

  hasFulfillmentReported(): boolean {
    return this.saleorTrackingNumber !== null;
  }
}
