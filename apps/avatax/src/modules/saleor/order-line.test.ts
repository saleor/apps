import { describe, expect, it } from "vitest";
import { OrderLineFragment } from "../../../generated/graphql";
import { SaleorOrderLine } from "./order-line";
import { SaleorOrderLineMockFactory } from "./order-line-mocks";

describe("SaleorOrderLine", () => {
  const validPayload = SaleorOrderLineMockFactory.graphqlPayload;

  it("should create a SaleorOrderLine from a valid payload", () => {
    const result = SaleorOrderLine.createFromGraphQL(validPayload);

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

  it("should get gross amount when tax is included", () => {
    const line = SaleorOrderLine.createFromGraphQL(validPayload)._unsafeUnwrap();

    expect(line.getAmount({ isTaxIncluded: true })).toBe(validPayload.totalPrice.gross.amount);
  });

  it("should get net amount when tax is not included", () => {
    const line = SaleorOrderLine.createFromGraphQL(validPayload)._unsafeUnwrap();

    expect(line.getAmount({ isTaxIncluded: false })).toBe(validPayload.totalPrice.net.amount);
  });

  it("should get product sku as item code if present", () => {
    const line = SaleorOrderLine.createFromGraphQL(validPayload)._unsafeUnwrap();

    expect(line.getItemCode()).toBe(validPayload.productSku);
  });

  it("should get product variant id as item code if sku is not present", () => {
    const line = SaleorOrderLine.createFromGraphQL({
      ...validPayload,
      productSku: null,
    })._unsafeUnwrap();

    expect(line.getItemCode()).toBe(validPayload.productVariantId);
  });

  it("should get empty string as item code if neither sku nor variant id is present", () => {
    const line = SaleorOrderLine.createFromGraphQL({
      ...validPayload,
      productSku: null,
      productVariantId: null,
    })._unsafeUnwrap();

    expect(line.getItemCode()).toBe("");
  });
});
