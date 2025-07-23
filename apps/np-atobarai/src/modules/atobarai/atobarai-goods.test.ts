import { describe, expect, it } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiMerchantCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiSecretSpCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-secret-sp-code";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-compnay-code";
import { mockedAtobaraiTerminalId } from "@/__tests__/mocks/atobarai/mocked-atobarai-terminal-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { SourceObjectFragment } from "@/generated/graphql";

import { AppChannelConfig } from "../app-config/app-config";
import {
  AtobaraiGoods,
  createAtobaraiGoods,
  getDiscountLine,
  getProductLines,
  getShippingLine,
  getVoucherLine,
} from "./atobarai-goods";

describe("createAtobaraiGoods", () => {
  const commonAppConfigProps = {
    name: "Config 1",
    id: "111",
    merchantCode: mockedAtobaraiMerchantCode,
    shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
    secretSpCode: mockedAtobaraiSecretSpCode,
    useSandbox: true,
    terminalId: mockedAtobaraiTerminalId,
  };

  const mockedAppChannelConfigWithoutSkuAsName = AppChannelConfig.create({
    ...commonAppConfigProps,
    skuAsName: false,
  })._unsafeUnwrap();

  describe("createAtobaraiGoods", () => {
    it("should create AtobaraiGoods from checkout with product line and shipping when checkout.discount is null", () => {
      const sourceObject: SourceObjectFragment = {
        ...mockedSourceObject,
        discount: null,
      };

      const goods = createAtobaraiGoods({ sourceObject }, mockedAppChannelConfig);

      expect(goods).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "product-sku",
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

    it("should create AtobaraiGoods from checkout with product line and with voucher if checkout.discount is present", () => {
      const goods = createAtobaraiGoods(
        { sourceObject: mockedSourceObject },
        mockedAppChannelConfig,
      );

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
            "goods_price": 137,
            "quantity": 1,
          },
        ]
      `);
    });

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

    it("shouldn't be assignable without createAtobaraiGoods", () => {
      // @ts-expect-error - if this fails - it means the type is not branded
      const testValue: AtobaraiGoods = [{ goods_name: "Test", goods_price: 100, quantity: 1 }];

      expect(testValue).toBeDefined();
    });
  });

  describe("getProductLines", () => {
    it("should return product lines with product name when skuAsName is false", () => {
      const lines = getProductLines({
        lines: mockedSourceObject.lines,
        useSkuAsName: false,
      });

      expect(lines).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "Product Name",
            "goods_price": 1234,
            "quantity": 5,
          },
        ]
      `);
    });

    it("should return product lines with SKU when skuAsName is true", () => {
      const lines = getProductLines({
        lines: mockedSourceObject.lines,
        useSkuAsName: true,
      });

      expect(lines).toMatchInlineSnapshot(`
        [
          {
            "goods_name": "product-sku",
            "goods_price": 1234,
            "quantity": 5,
          },
        ]
      `);
    });
  });

  describe("getVoucherLine", () => {
    it("should return voucher line when voucher amount greater than 0", () => {
      const voucherLine = getVoucherLine(2344);

      expect(voucherLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Voucher",
          "goods_price": 2344,
          "quantity": 1,
        }
      `);
    });

    it("should return null when voucher amount is 0", () => {
      const voucherLine = getVoucherLine(0);

      expect(voucherLine).toBeNull();
    });

    it("should return null when voucher amount is not present", () => {
      const voucherLine = getVoucherLine(undefined);

      expect(voucherLine).toBeNull();
    });
  });

  describe("getShippingLine", () => {
    it("should return shipping line when shipping amount is greater than 0", () => {
      const shippingLine = getShippingLine(500);

      expect(shippingLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Shipping",
          "goods_price": 500,
          "quantity": 1,
        }
      `);
    });

    it("should return null when shipping amount is 0", () => {
      const shippingLine = getShippingLine(0);

      expect(shippingLine).toBeNull();
    });
  });

  describe("getDiscountLine", () => {
    it("should return discount line when discount amount is greater than 0", () => {
      const discountLine = getDiscountLine(2344);

      expect(discountLine).toMatchInlineSnapshot(`
        {
          "goods_name": "Discount",
          "goods_price": -2344,
          "quantity": 1,
        }
      `);
    });

    it("should return null when discount amount is 0", () => {
      const discountLine = getDiscountLine(0);

      expect(discountLine).toBeNull();
    });
  });
});
