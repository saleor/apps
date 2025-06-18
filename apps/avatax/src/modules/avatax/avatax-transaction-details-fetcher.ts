import { IAvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";

export class AvataxTransactionDetailsFetcher {
  constructor(private avataxSdkClientFactory: IAvataxSdkClientFactory) {}

  async fetchTransactionDetails({
    isSandbox,
    credentials,
    transactionCode,
    companyCode,
  }: {
    isSandbox: boolean;
    credentials: { username: string; password: string };
    transactionCode: string;
    companyCode: string;
  }) {
    const avataxClient = this.avataxSdkClientFactory.createClient({
      isSandbox,
      credentials,
    });

    try {
      const response = await avataxClient.getTransactionByCode({
        transactionCode: transactionCode,
        companyCode: companyCode,
        include: "TaxDetailsByTaxType",
      });

      return response;
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      throw error;
    }
  }
}
