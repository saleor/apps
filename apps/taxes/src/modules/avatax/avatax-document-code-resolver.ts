export class AvataxDocumentCodeResolver {
  resolve(avataxDocumentCode: string | null | undefined, orderId: string): string {
    /*
     * The value for "code" can be provided in the metadata.
     * Read more: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/cert-document-codes/
     * The returned document code must be idempotent (same document code for the same order).
     */
    return avataxDocumentCode ?? orderId;
  }
}
