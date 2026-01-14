import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment } from "@/generated/graphql";
import { zodReadableError } from "@/lib/zod-readable-error";
import { AtobaraiAddressFormatter } from "@/modules/atobarai/atobarai-address-formatter";

import { formatCustomerName, formatPhone } from "./atobarai-address-helpers";

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

  const parseResult = AtobaraiDeliveryDestinationSchema.safeParse({
    customer_name: formatCustomerName(shippingAddress),
    company_name: shippingAddress.companyName,
    zip_code: shippingAddress.postalCode,
    address: new AtobaraiAddressFormatter().formatAddress(shippingAddress),
    tel: formatPhone(shippingAddress.phone),
  });

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiDeliveryDestinationMissingDataError(
      `Invalid delivery destination data: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiDeliveryDestination = z.infer<typeof AtobaraiDeliveryDestinationSchema>;
