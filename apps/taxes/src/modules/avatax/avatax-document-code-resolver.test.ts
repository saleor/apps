import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { AvataxDocumentCodeResolver } from "./avatax-document-code-resolver";
import { expect, describe, it } from "vitest";

const resolver = new AvataxDocumentCodeResolver();

describe("AvataxDocumentCodeResolver", () => {
  it("returns document code when provided in metadata", () => {
    const order = {
      id: "id",
      avataxDocumentCode: "123",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(resolver.resolve(order.avataxDocumentCode, order.id)).toBe("123");
  });
  it("returns order id when document code is not provided in metadata", () => {
    const order = {
      id: "id",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(resolver.resolve(order.avataxDocumentCode, order.id)).toBe("id");
  });
});
