import { describe, expect, it } from "vitest";

import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { SourceObjectFragment } from "@/generated/graphql";

import { AtobaraiGoods } from "./atobarai-goods";
import { TransactionGoodBuilder } from "./transaction-goods-builder";

describe("TransactionGoodBuilder", () => {
  describe("build", () => {
    it("should build AtobaraiGoods from checkout with product line and shipping when checkout.discount is null", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
      };

      const builder = new TransactionGoodBuilder();

      const goods = builder.build({ sourceObject, useSkuAsName: false });

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 137,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should build AtobaraiGoods from checkout with product line and with voucher if checkout.discount is present", () => {
      const builder = new TransactionGoodBuilder();

      const goods = builder.build({
        sourceObject: mockedSourceObject,
        useSkuAsName: false,
      });

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Voucher",
            "goods_price": -78,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 137,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should throw AtobaraiLineCalculationError when checkout line does not have a variant", () => {
      const sourceObjectWithNullVariant = {
        ...mockedSourceObject,
        lines: [
          {
            __typename: "CheckoutLine" as const,
            quantity: 1,
            totalPrice: {
              gross: {
                amount: 1000,
              },
            },
            checkoutVariant: null,
          },
        ],
        discount: null,
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      } as unknown as SourceObjectFragment;

      const builder = new TransactionGoodBuilder();

      expect(() =>
        builder.build({ sourceObject: sourceObjectWithNullVariant, useSkuAsName: false }),
      ).toThrow("Line CheckoutLine does not have a variant. Cannot convert to AtobaraiGoods.");
    });

    it("should throw AtobaraiLineCalculationError when order line does not have a variant", () => {
      const sourceObjectWithNullVariant = {
        __typename: "Order" as const,
        id: "order-id",
        userEmail: "order-user@example.com",
        channel: {
          id: "channel-id",
          slug: "default-channel",
          currencyCode: "JPY",
        },
        shippingAddress: mockedSourceObject.shippingAddress,
        billingAddress: null,
        lines: [
          {
            __typename: "OrderLine" as const,
            quantity: 1,
            totalPrice: {
              gross: {
                amount: 1000,
              },
            },
            orderVariant: null,
          },
        ],
        discount: null,
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      } as unknown as SourceObjectFragment;

      const builder = new TransactionGoodBuilder();

      expect(() =>
        builder.build({ sourceObject: sourceObjectWithNullVariant, useSkuAsName: false }),
      ).toThrow("Line OrderLine does not have a variant. Cannot convert to AtobaraiGoods.");
    });

    it("shouldn't be assignable without createAtobaraiGoods", () => {
      // @ts-expect-error - if this fails - it means the type is not branded
      const testValue: AtobaraiGoods = [{ goods_name: "Test", goods_price: 100, quantity: 1 }];

      expect(testValue).toBeDefined();
    });
  });
});
