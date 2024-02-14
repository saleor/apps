export class AvataxDocumentCodeResolver {
  resolve({
    avataxDocumentCode,
    orderId,
  }: {
    avataxDocumentCode: string | null | undefined;
    orderId: string | undefined;
  }): string {
    /*
     * The value for "code" can be provided in the metadata.
     * Read more: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/cert-document-codes/
     * The returned document code must be idempotent (same document code for the same order).
     */

    const code = avataxDocumentCode ?? orderId;

    if (!code) {
      throw new Error("Order id or document code must be provided");
    }

    /*
     * The requirement from AvaTax API is that document code is a string that must be between 1 and 20 characters long.
     */
    return code.slice(0, 20);
  }
}
