import { z } from "zod";

export class AtobaraiDeliveryDestination {
  static schema = z.object({});

  getDeliveryDestination(): z.infer<typeof AtobaraiDeliveryDestination.schema> {
    // TODO: convert Saleor shipping address to AtobaraiDeliveryDestination format
    return {};
  }
}
