import { describe, expect, it } from "vitest";

import { mockedAtobaraiMerchantCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-compnay-code";
import { mockedAtobaraiSpCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-sp-code";
import { mockedAtobaraiTerminalId } from "@/__tests__/mocks/atobarai/mocked-atobarai-terminal-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { SourceObjectFragment } from "@/generated/graphql";

import { AppChannelConfig } from "../app-config/app-config";
import { AtobaraiGoods, createAtobaraiGoods } from "./atobarai-goods";

describe("createAtobaraiGoods", () => {
  const commonAppConfigProps = {
    name: "Config 1",
    id: "111",
    merchantCode: mockedAtobaraiMerchantCode,
    shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
    spCode: mockedAtobaraiSpCode,
    useSandbox: true,
    terminalId: mockedAtobaraiTerminalId,
  };

  const mockedAppChannelConfigWithSkuAsName = AppChannelConfig.create({
    ...commonAppConfigProps,
    skuAsName: true,
  })._unsafeUnwrap();

  const mockedAppChannelConfigWithoutSkuAsName = AppChannelConfig.create({
    ...commonAppConfigProps,
    skuAsName: false,
  })._unsafeUnwrap();

  describe("with product lines only", () => {
    it("should create AtobaraiGoods from checkout with product name when skuAsName is false", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithoutSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 500,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should create AtobaraiGoods from checkout with SKU when skuAsName is true", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "product-sku",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 500,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should create AtobaraiGoods from order with order variant", () => {
      const sourceObject: SourceObjectFragment = {
        __typename: "Order",
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
            __typename: "OrderLine",
            quantity: 3,
            unitPrice: {
              gross: {
                amount: 1_000,
              },
            },
            orderVariant: {
              product: {
                name: "Order Product",
              },
              sku: "ORDER-SKU-1",
            },
          },
        ],
        discount: null,
        shippingPrice: {
          gross: {
            amount: 800,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "ORDER-SKU-1",
            "goods_price": 1000,
            "quantity": 3,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 800,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should create AtobaraiGood from checokut with product name when skuAsName is true and product has no SKU", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        lines: [
          {
            __typename: "CheckoutLine",
            quantity: 2,
            unitPrice: {
              gross: {
                amount: 1500,
              },
            },
            checkoutVariant: {
              product: {
                name: "Product Without SKU",
              },
              sku: null,
            },
          },
        ],
        discount: null,
        shippingPrice: {
          gross: {
            amount: 300,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Without SKU",
            "goods_price": 1500,
            "quantity": 2,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 300,
            "quantity": 1,
          },
        ]
      `);
    });
  });

  describe("with discount", () => {
    it("should include voucher line when discount is present", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        // Use the existing discount from mockedSourceObject
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "product-sku",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 78,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 500,
            "quantity": 1,
          },
        ]
      `);
    });

    it("should not include voucher line when discount is not present", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
        shippingPrice: {
          gross: {
            amount: 500,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithoutSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 500,
            "quantity": 1,
          },
        ]
      `);
    });
  });

  describe("with shipping", () => {
    it("should include shipping line when shipping price is present", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
        // Use default shipping price from mockedSourceObject
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithoutSkuAsName);

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

    it("should not include shipping line when shipping price is not present", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
        shippingPrice: {
          gross: {
            amount: 0,
          },
        },
      };

      // Override shippingPrice with null using type assertion
      const sourceObjectWithoutShipping = {
        ...sourceObject,
        shippingPrice: null,
      } as unknown as SourceObjectFragment;

      const goods = createAtobaraiGoods(
        { sourceObject: sourceObjectWithoutShipping },
        mockedAppChannelConfigWithoutSkuAsName,
      );

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
        ]
      `);
    });
  });

  describe("with complete scenario", () => {
    it("should create complete AtobaraiGoods with products, voucher, and shipping", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        // Use existing discount and shipping from mockedSourceObject
        lines: [
          {
            __typename: "CheckoutLine",
            quantity: 2,
            unitPrice: {
              gross: {
                amount: 2_000,
              },
            },
            checkoutVariant: {
              product: {
                name: "Complete Product 1",
              },
              sku: "COMP-SKU-1",
            },
          },
          {
            __typename: "CheckoutLine",
            quantity: 1,
            unitPrice: {
              gross: {
                amount: 3_000,
              },
            },
            checkoutVariant: {
              product: {
                name: "Complete Product 2",
              },
              sku: "COMP-SKU-2",
            },
          },
        ],
        discount: {
          amount: 200,
        },
        shippingPrice: {
          gross: {
            amount: 600,
          },
        },
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfigWithoutSkuAsName);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Complete Product 1",
            "goods_price": 2000,
            "quantity": 2,
          },
          {
            "goods_name": "Complete Product 2",
            "goods_price": 3000,
            "quantity": 1,
          },
          {
            "goods_name": "Voucher",
            "goods_price": 200,
            "quantity": 1,
          },
          {
            "goods_name": "Shipping",
            "goods_price": 600,
            "quantity": 1,
          },
        ]
      `);
    });
  });

  describe("error cases", () => {
    it("should throw BaseError when checkout line does not have a variant", () => {
      // Create a sourceObject with a line that has a null variant
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

      expect(() =>
        createAtobaraiGoods(
          { sourceObject: sourceObjectWithNullVariant },
          mockedAppChannelConfigWithoutSkuAsName,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[BaseError: Line CheckoutLine does not have a variant. Cannot convert to AtobaraiGoods.]`,
      );
    });

    it("should throw BaseError when order line does not have a variant", () => {
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

      expect(() =>
        createAtobaraiGoods(
          { sourceObject: sourceObjectWithNullVariant },
          mockedAppChannelConfigWithoutSkuAsName,
        ),
      ).toThrowErrorMatchingInlineSnapshot(
        `[BaseError: Line OrderLine does not have a variant. Cannot convert to AtobaraiGoods.]`,
      );
    });
  });

  describe("type safety", () => {
    it("shouldn't be assignable without createAtobaraiGoods", () => {
      // @ts-expect-error - if this fails - it means the type is not branded
      const testValue: AtobaraiGoods = [{ goods_name: "Test", goods_price: 100, quantity: 1 }];

      expect(testValue).toBeDefined();
    });
  });
});
