import { describe, expect, it } from "vitest";

import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { AvataxDocumentCodeResolver } from "./avatax-document-code-resolver";

const resolver = new AvataxDocumentCodeResolver();

describe("AvataxDocumentCodeResolver", () => {
  it("returns document code when provided in metadata", () => {
    const order = {
      number: "42",
      avataxDocumentCode: "123",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(
      resolver.resolve({ avataxDocumentCode: order.avataxDocumentCode, orderNumber: order.number }),
    ).toBe("123");
  });

  it("returns order number when document code is not provided in metadata", () => {
    const order = {
      number: "number",
    } as unknown as OrderConfirmedSubscriptionFragment;

    expect(
      resolver.resolve({ avataxDocumentCode: order.avataxDocumentCode, orderNumber: order.number }),
    ).toBe("number");
  });

  it("returns sliced document code when avataxDocumentCode too long", () => {
    expect(
      resolver.resolve({
        avataxDocumentCode: "long-document-code-above-20-characters-1234567890",
        orderNumber: "long-document-code-above-20-characters-",
      }),
    ).toBe("long-document-code-a");
  });

  it("returns sliced document code when orderNumber too long", () => {
    expect(
      resolver.resolve({
        avataxDocumentCode: null,
        orderNumber: "long-order-number-above-20-characters-1234567890",
      }),
    ).toBe("long-order-number-ab");
  });
});
