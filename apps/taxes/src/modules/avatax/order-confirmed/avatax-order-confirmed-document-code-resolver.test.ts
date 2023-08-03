import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { AvataxOrderConfirmedDocumentCodeResolver } from "./avatax-order-confirmed-document-code-resolver";
import { expect, describe, it } from "vitest";

const resolver = new AvataxOrderConfirmedDocumentCodeResolver();

describe("AvataxOrderConfirmedDocumentCodeResolver", () => {
  it("returns document code when provided in metadata", () => {
    expect(
      resolver.resolve({
        id: "id",
        avataxDocumentCode: "123",
      } as unknown as OrderConfirmedSubscriptionFragment)
    ).toBe("123");
  });
  it("returns order id when document code is not provided in metadata", () => {
    expect(
      resolver.resolve({
        id: "id",
      } as unknown as OrderConfirmedSubscriptionFragment)
    ).toBe("id");
  });
});
