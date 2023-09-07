import { OrderPayloadFragment } from "../../../../generated/graphql";
import { ShopAddress } from "../../shop-info/shop-address";

export interface InvoiceGenerator {
  generate(input: {
    order: OrderPayloadFragment;
    invoiceNumber: string;
    filename: string;
    companyAddressData: ShopAddress;
  }): Promise<void>;
}
