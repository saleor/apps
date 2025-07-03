import { z } from "zod";

export class AtobaraiCustomer {
  static schema = z.object({});

  getCustomerAddress(): z.infer<typeof AtobaraiCustomer.schema> {
    // TODO: convert Saleor billing address to AtobaraiCustomer format
    return {};
  }
}
