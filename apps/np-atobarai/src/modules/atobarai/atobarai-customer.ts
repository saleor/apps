import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { SourceObjectFragment } from "@/generated/graphql";
import { zodReadableError } from "@/lib/zod-readable-error";
import { AtobaraiAddressFormatter } from "@/modules/atobarai/atobarai-address-formatter";

import {
  formatCustomerName,
  formatPhone,
  getEmailFromSourceObject,
} from "./atobarai-address-helpers";

export const AtobaraiCustomerSchema = z
  .object({
    customer_name: z.string(),
    company_name: z.string().optional(),
    zip_code: z.string(),
    address: z.string(),
    tel: z.string(),
    email: z.string().email(),
  })
  .brand("AtobaraiCustomer");

export const AtobaraiCustomerMissingDataError = BaseError.subclass(
  "AtobaraiCustomerMissingDataError",
  {
    props: {
      _brand: "AtobaraiCustomerMissingDataError" as const,
    },
  },
);

/**
 * Creates Atobarai customer from Saleor sourceObject billingAddress and email.
 */
export const createAtobaraiCustomer = (event: { sourceObject: SourceObjectFragment }) => {
  const billingAddress = event.sourceObject.billingAddress;

  if (!billingAddress) {
    throw new AtobaraiCustomerMissingDataError(
      "Billing address is required to create AtobaraiCustomer",
    );
  }

  if (!billingAddress.phone) {
    throw new AtobaraiCustomerMissingDataError(
      "Phone number is required to create AtobaraiCustomer",
    );
  }

  const email = getEmailFromSourceObject(event.sourceObject);

  if (!email) {
    throw new AtobaraiCustomerMissingDataError("Email is required to create AtobaraiCustomer");
  }

  const parseResult = AtobaraiCustomerSchema.safeParse({
    customer_name: formatCustomerName(billingAddress),
    company_name: billingAddress.companyName,
    zip_code: billingAddress.postalCode,
    address: new AtobaraiAddressFormatter().formatAddress(billingAddress),
    tel: formatPhone(billingAddress.phone),
    email: email,
  });

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiCustomerMissingDataError(`Invalid customer data: ${readableError.message}`, {
      cause: readableError,
    });
  }

  return parseResult.data;
};

export type AtobaraiCustomer = z.infer<typeof AtobaraiCustomerSchema>;
