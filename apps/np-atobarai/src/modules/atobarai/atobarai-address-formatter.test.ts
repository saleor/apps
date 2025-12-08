import { describe, expect, it } from "vitest";

import { AddressFragment } from "@/generated/graphql";
import { AtobaraiAddressFormatter } from "@/modules/atobarai/atobarai-address-formatter";

const addressFragment = {
  firstName: "FirstName",
  lastName: "LastName",
  companyName: "CompanyName",
  streetAddress1: "StreetAddress1",
  streetAddress2: "StreetAddress2",
  phone: "+81PhoneNumber",
  postalCode: "1000001",
  countryArea: "CountryArea",
  country: {
    code: "JP",
  },
  city: "Tokyo",
  cityArea: "Shibyua",
} satisfies AddressFragment;

describe("formatAddress", () => {
  it("should convert address into Atobarai required address", () => {
    const address = new AtobaraiAddressFormatter().formatAddress(addressFragment);

    expect(address).toMatchInlineSnapshot(
      `"CountryArea千代田区千代田StreetAddress1StreetAddress2"`,
    );
  });
});
