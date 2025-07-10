import { z } from "zod";

import { AddressFragment, TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";

/**
 * Converts a Saleor billing address from Checkout / Order to an Atobarai customer format.
 */
export class AtobaraiCustomer {
  static schema = z.object({
    customer_name: z.string(),
    company_name: z.string(),
    zip_code: z.string(),
    address: z.string(),
    tel: z.string(),
    email: z.string().email(),
  });

  static MissingDataError = BaseError.subclass("AtobaraiCustomerMissingDataError", {
    props: {
      _brand: "AtobaraiCustomerMissingDataError" as const,
    },
  });

  private billingAddress: AddressFragment;
  private email: string;
  private phone: string;

  private constructor(params: { billingAddress: AddressFragment; email: string; phone: string }) {
    this.billingAddress = params.billingAddress;
    this.email = params.email;
    this.phone = params.phone;
  }

  static createFromEvent(event: Pick<TransactionInitializeSessionEventFragment, "sourceObject">) {
    if (!event.sourceObject.billingAddress) {
      throw new AtobaraiCustomer.MissingDataError(
        "Billing address is required to create AtobaraiCustomer",
      );
    }

    const email =
      event.sourceObject.__typename === "Checkout"
        ? event.sourceObject.email
        : event.sourceObject.userEmail;

    if (!email) {
      throw new AtobaraiCustomer.MissingDataError("Email is required to create AtobaraiCustomer");
    }

    if (!event.sourceObject.billingAddress.phone) {
      throw new AtobaraiCustomer.MissingDataError(
        "Phone number is required to create AtobaraiCustomer",
      );
    }

    return new AtobaraiCustomer({
      billingAddress: event.sourceObject.billingAddress,
      email,
      phone: event.sourceObject.billingAddress.phone,
    });
  }

  private getCustomerName(): string {
    return `${this.billingAddress.firstName} ${this.billingAddress.lastName}`;
  }

  private getAddress(): string {
    // TODO: add support for fill_missing_address
    return `${this.billingAddress.countryArea}${this.billingAddress.streetAddress1}${this.billingAddress.streetAddress2}`;
  }

  private getPhone(): string {
    return this.phone.replace("+81", "0");
  }

  getCustomerAddress(): z.infer<typeof AtobaraiCustomer.schema> {
    return {
      customer_name: this.getCustomerName(),
      company_name: this.billingAddress.companyName,
      zip_code: this.billingAddress.postalCode,
      address: this.getAddress(),
      tel: this.getPhone(),
      email: this.email,
    };
  }
}
