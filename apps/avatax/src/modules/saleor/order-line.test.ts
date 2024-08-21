import { describe, expect, it } from "vitest";

import { OrderLineFragment } from "../../../generated/graphql";
import { SaleorOrderLine } from "./order-line";
import { SaleorOrderLineMockFactory } from "./order-line-mocks";

describe("SaleorOrderLine", () => {
  it("should create a SaleorOrderLine from a valid payload", () => {
    const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
    const result = SaleorOrderLine.createFromGraphQL(payload);

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorOrderLine);
  });

  it("should fail to create a SaleorOrderLine when payload is missing", () => {
    const result = SaleorOrderLine.createFromGraphQL({} as OrderLineFragment);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(SaleorOrderLine.ParsingError);
    }
  });

  describe("getAmount method", () => {
    it("should get gross amount when tax is included", () => {
      const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
      const line = SaleorOrderLine.createFromGraphQL(payload)._unsafeUnwrap();

      expect(line.getAmount({ isTaxIncluded: true })).toBe(payload.totalPrice.gross.amount);
    });

    it("should get net amount when tax is not included", () => {
      const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
      const line = SaleorOrderLine.createFromGraphQL(payload)._unsafeUnwrap();

      expect(line.getAmount({ isTaxIncluded: false })).toBe(payload.totalPrice.net.amount);
    });
  });

  describe("getItemCode method", () => {
    it("should get product sku as item code if present", () => {
      const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
      const line = SaleorOrderLine.createFromGraphQL(payload)._unsafeUnwrap();

      expect(line.getItemCode()).toBe(payload.productSku);
    });

    it("should get product variant id as item code if sku is not present", () => {
      const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
      const line = SaleorOrderLine.createFromGraphQL({
        ...payload,
        productSku: null,
      })._unsafeUnwrap();

      expect(line.getItemCode()).toBe(payload.productVariantId);
    });

    it("should get empty string as item code if neither sku nor variant id is present", () => {
      const payload = SaleorOrderLineMockFactory.getGraphqlPayload();
      const line = SaleorOrderLine.createFromGraphQL({
        ...payload,
        productSku: null,
        productVariantId: null,
      })._unsafeUnwrap();

      expect(line.getItemCode()).toBe("");
    });
  });
});
