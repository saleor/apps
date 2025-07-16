import { describe, expect, it } from "vitest";

import { mockedAtobaraiCustomer } from "@/__tests__/mocks/atobarai/mocked-atobarai-customer";
import { mockedAtobaraiDeliveryDestination } from "@/__tests__/mocks/atobarai/mocked-atobarai-delivery-destination";
import { mockedAtobaraiGoods } from "@/__tests__/mocks/atobarai/mocked-atobarai-goods";
import { mockedAtobaraiMoney } from "@/__tests__/mocks/atobarai/mocked-atobarai-money";
import { mockedAtobaraiShopOrderDate } from "@/__tests__/mocks/atobarai/mocked-atobarai-shop-order-date";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorTransactionToken } from "@/__tests__/mocks/saleor/mocked-saleor-transaction-token";

import {
  AtobaraiChangeTransactionPayload,
  createAtobaraiChangeTransactionPayload,
} from "./atobarai-change-transaction-payload";

describe("createAtobaraiChangeTransactionPayload", () => {
  it("should create a valid AtobaraiChangeTransactionPayload", () => {
    const result = createAtobaraiChangeTransactionPayload({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      saleorTransactionToken: mockedSaleorTransactionToken,
      atobaraiMoney: mockedAtobaraiMoney,
      atobaraiCustomer: mockedAtobaraiCustomer,
      atobaraiDeliveryDestination: mockedAtobaraiDeliveryDestination,
      atobaraiGoods: mockedAtobaraiGoods,
      atobaraiShopOrderDate: mockedAtobaraiShopOrderDate,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "transactions": [
          {
            "billed_amount": 1000,
            "customer": {
              "address": "BillingCountryAreaBillingStreetAddress1BillingStreetAddress2",
              "company_name": "BillingCompanyName",
              "customer_name": "BillingLastName BillingFirstName",
              "email": "source-object@email.com",
              "tel": "0billingPhone",
              "zip_code": "BillingPostalCode",
            },
            "dest_customer": {
              "address": "ShippingCountryAreaShippingStreetAddress1ShippingStreetAddress2",
              "company_name": "ShippingCompanyName",
              "customer_name": "ShippingLastName ShippingFirstName",
              "tel": "0shippingPhone",
              "zip_code": "ShippingPostalCode",
            },
            "goods": [
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
            ],
            "np_transaction_id": "np_transaction_123",
            "settlement_type": "02",
            "shop_order_date": "2025-07-08",
            "shop_transaction_id": "mocked-saleor-transaction-token-uuid",
          },
        ],
      }
    `);
  });

  it("should throw ZodError when date is in wrong format", () => {
    expect(() =>
      createAtobaraiChangeTransactionPayload({
        atobaraiTransactionId: mockedAtobaraiTransactionId,
        saleorTransactionToken: mockedSaleorTransactionToken,
        atobaraiMoney: mockedAtobaraiMoney,
        atobaraiCustomer: mockedAtobaraiCustomer,
        atobaraiDeliveryDestination: mockedAtobaraiDeliveryDestination,
        atobaraiGoods: mockedAtobaraiGoods,
        // @ts-expect-error - testing invalid date
        atobaraiShopOrderDate: "invalid-date",
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "validation": "regex",
          "code": "invalid_string",
          "message": "Date must be in YYYY-MM-DD format",
          "path": [
            "transactions",
            0,
            "shop_order_date"
          ]
        }
      ]]
    `);
  });

  it("should throw ZodError when saleorTransactionToken is too long (more than 40 chars)", () => {
    expect(() =>
      createAtobaraiChangeTransactionPayload({
        atobaraiTransactionId: mockedAtobaraiTransactionId,
        // @ts-expect-error - testing invalid token
        saleorTransactionToken: "invalid-token-that-is-way-too-long-more-than-40-chars",
        atobaraiMoney: mockedAtobaraiMoney,
        atobaraiCustomer: mockedAtobaraiCustomer,
        atobaraiDeliveryDestination: mockedAtobaraiDeliveryDestination,
        atobaraiGoods: mockedAtobaraiGoods,
        atobaraiShopOrderDate: mockedAtobaraiShopOrderDate,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_big",
          "maximum": 40,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at most 40 character(s)",
          "path": [
            "transactions",
            0,
            "shop_transaction_id"
          ]
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiChangeTransactionPayload", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiChangeTransactionPayload = {};

    expect(testValue).toStrictEqual({});
  });
});
