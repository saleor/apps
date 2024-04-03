import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { AvataxDocumentCodeResolver } from "./avatax-document-code-resolver";
import { describe, expect, it } from "vitest";

const resolver = new AvataxDocumentCodeResolver();

describe("AvataxDocumentCodeResolver", () => {
  it("returns document code when provided in metadata", () => {
    const order = {
      id: "id",
      avataxDocumentCode: "123",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(
      resolver.resolve({ avataxDocumentCode: order.avataxDocumentCode, orderId: order.id }),
    ).toBe("123");
  });
  it("returns order id when document code is not provided in metadata", () => {
    const order = {
      id: "id",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(
      resolver.resolve({ avataxDocumentCode: order.avataxDocumentCode, orderId: order.id }),
    ).toBe("id");
  });
  it("returns sliced document code when avataxDocumentCode too long", () => {
    expect(
      resolver.resolve({ avataxDocumentCode: "123456789012345678901234567890", orderId: "id" }),
    ).toBe("12345678901234567890");
  });
  it("returns sliced document code when orderId too long", () => {
    expect(
      resolver.resolve({ avataxDocumentCode: null, orderId: "123456789012345678901234567890" }),
    ).toBe("12345678901234567890");
  });
});
