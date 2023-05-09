import { OrderPayloadFragment } from "../../../../generated/graphql";
import { SellerShopConfig } from "../../app-configuration/schema-v1/app-config-v1";

export interface InvoiceGenerator {
  generate(input: {
    order: OrderPayloadFragment;
    invoiceNumber: string;
    filename: string;
    companyAddressData: SellerShopConfig["address"];
  }): Promise<void>;
}
