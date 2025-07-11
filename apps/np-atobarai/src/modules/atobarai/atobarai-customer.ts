import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import {
  formatAddress,
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
export const createAtobaraiCustomer = (
  event: Pick<TransactionInitializeSessionEventFragment, "sourceObject">,
) => {
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

  return AtobaraiCustomerSchema.parse({
    customer_name: formatCustomerName(billingAddress),
    company_name: billingAddress.companyName,
    zip_code: billingAddress.postalCode,
    address: formatAddress(billingAddress),
    tel: formatPhone(billingAddress.phone),
    email: email,
  });
};

export type AtobaraiCustomer = z.infer<typeof AtobaraiCustomerSchema>;
