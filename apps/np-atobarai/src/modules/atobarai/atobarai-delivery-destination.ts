import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment } from "@/generated/graphql";

import { formatAddress, formatCustomerName, formatPhone } from "./atobarai-address-helpers";

export const AtobaraiDeliveryDestinationSchema = z
  .object({
    customer_name: z.string(),
    company_name: z.string().optional(),
    zip_code: z.string(),
    address: z.string(),
    tel: z.string(),
  })
  .brand("AtobaraiDeliveryDestination");

export const AtobaraiDeliveryDestinationMissingDataError = BaseError.subclass(
  "AtobaraiDeliveryDestinationMissingDataError",
  {
    props: {
      _brand: "AtobaraiDeliveryDestinationMissingDataError" as const,
    },
  },
);

/**
 * Creates Atobarai delivery destination from Saleor sourceObject shippingAddress and email.
 */
export const createAtobaraiDeliveryDestination = (event: {
  sourceObject: SourceObjectFragment;
}): z.infer<typeof AtobaraiDeliveryDestinationSchema> => {
  const shippingAddress = event.sourceObject.shippingAddress;

  if (!shippingAddress) {
    throw new AtobaraiDeliveryDestinationMissingDataError(
      "Shipping address is required to create AtobaraiDeliveryDestination",
    );
  }

  if (!shippingAddress.phone) {
    throw new AtobaraiDeliveryDestinationMissingDataError(
      "Phone number is required to create AtobaraiDeliveryDestination",
    );
  }

  return AtobaraiDeliveryDestinationSchema.parse({
    customer_name: formatCustomerName(shippingAddress),
    company_name: shippingAddress.companyName,
    zip_code: shippingAddress.postalCode,
    address: formatAddress(shippingAddress),
    tel: formatPhone(shippingAddress.phone),
  });
};

export type AtobaraiDeliveryDestination = z.infer<typeof AtobaraiDeliveryDestinationSchema>;
