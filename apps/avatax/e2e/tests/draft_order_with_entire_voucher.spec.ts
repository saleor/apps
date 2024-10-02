/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { describe, it } from "vitest";

import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateAddress,
  DraftOrderUpdateShippingMethod,
  DraftOrderUpdateVoucher,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=4846&case_id=18392
describe("App should calculate taxes on draft order with entire order voucher applied TC: AVATAX_28", () => {
  const testCase = e2e("Draft order with voucher entire order [pricesEnteredWithTax: False]");
  const staffCredentials = {
    email: process.env.E2E_USER_NAME as string,
    password: process.env.E2E_USER_PASSWORD as string,
  };

  const CURRENCY = "USD";

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 32.66;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 30;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 2.66;

  const SHIPPING_GROSS_PRICE = 75.46;
  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.15;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 108.12;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 99.31;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 8.81;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING_AFTER_VOUCHER = 103.22;
  const TOTAL_NET_PRICE_AFTER_SHIPPING_AFTER_VOUCHER = 94.81;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING_AFTER_VOUCHER = 8.41;

  const SHIPPING_GROSS_PRICE_AFTER_VOUCHER = 75.45;
  const SHIPPING_NET_PRICE_AFTER_VOUCHER = 69.31;
  const SHIPPING_TAX_PRICE_AFTER_VOUCHER = 6.14;

  it("creates token for staff user", async () => {
    await testCase
      .step("Create token for staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(StaffUserTokenCreate)
      .withGraphQLVariables(staffCredentials)
      .expectStatus(200)
      .expectJsonLike({
        data: {
          tokenCreate: {
            token: "typeof $V === 'string'",
          },
        },
      })
      .stores("StaffUserToken", "data.tokenCreate.token")
      .retry();
  });
  it("creates order in channel pricesEnteredWithTax: False", async () => {
    await testCase
      .step("Create order in channel")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateDraftOrder)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:PricesWithoutTax",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJsonLike({
        data: {
          draftOrderCreate: {
            order: {
              id: "typeof $V === 'string'",
            },
          },
        },
      })
      .stores("OrderID", "data.draftOrderCreate.order.id");
  });
  it("should create order lines as staff user", async () => {
    await testCase
      .step("Create order lines as staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateOrderLines)
      .withGraphQLVariables({
        orderId: "$S{OrderID}",
        input: [{ quantity: 1, variantId: "$M{Product.Regular.variantId}" }],
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderLinesCreate.orderLines[0].quantity", 1)
      .expectJson(
        "data.orderLinesCreate.order.total.gross.amount",
        TOTAL_NET_PRICE_BEFORE_SHIPPING,
      );
  });
  it("should update order as staff user", async () => {
    await testCase
      .step("Update order as staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(DraftOrderUpdateAddress)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:Address",
        "@OVERRIDES@": {
          orderId: "$S{OrderID}",
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.draftOrderUpdate.order.id", "$S{OrderID}")
      .expectJson(
        "data.draftOrderUpdate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
          currency: CURRENCY,
        }),
      );
  });

  it("should update order's shipping method as staff user", async () => {
    await testCase
      .step("Update shipping method as staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(DraftOrderUpdateShippingMethod)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:PricesWithoutTax:ShippingMethod",
        "@OVERRIDES@": {
          orderId: "$S{OrderID}",
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderUpdateShipping.order.id", "$S{OrderID}")
      .expectJson(
        "data.orderUpdateShipping.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.orderUpdateShipping.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
          currency: CURRENCY,
        }),
      );
  });

  it("should add voucher code to draft order", async () => {
    await testCase
      .step("add voucher to draft order")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(DraftOrderUpdateVoucher)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:VoucherCode",
        "@OVERRIDES@": {
          orderId: "$S{OrderID}",
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.draftOrderUpdate.order.id", "$S{OrderID}")
      .expectJson(
        "data.draftOrderUpdate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING_AFTER_VOUCHER,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING_AFTER_VOUCHER,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING_AFTER_VOUCHER,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.draftOrderUpdate.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE_AFTER_VOUCHER,
          net: SHIPPING_NET_PRICE_AFTER_VOUCHER,
          tax: SHIPPING_TAX_PRICE_AFTER_VOUCHER,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.draftOrderUpdate.order.undiscountedTotal",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .expectJson("data.draftOrderUpdate.order.discounts[0].type", "VOUCHER");
  });
  it("should complete draft order", async () => {
    await testCase
      .step("Complete draft order")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(DraftOrderComplete)
      .withGraphQLVariables({
        id: "$S{OrderID}",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.draftOrderComplete.order.id", "$S{OrderID}");
  });
});
