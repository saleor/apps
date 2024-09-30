/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { describe, it } from "vitest";

import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateAddress,
  DraftOrderUpdateShippingMethod,
  OrderDiscountAdd,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=139&case_id=18386
describe("App should calculate taxes for draft order with manual total discount applied TC: AVATAX_22", () => {
  const testCase = e2e("Product with tax class [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: process.env.E2E_USER_NAME as string,
    password: process.env.E2E_USER_PASSWORD as string,
  };

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const TOTAL_GROSS_SHIPPING_PRICE = 69.31;
  const TOTAL_NET_SHIPPING_PRICE = 63.66;
  const TOTAL_TAX_SHIPPING_PRICE = 5.65;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.44;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.87;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT = 75.88;
  const TOTAL_NET_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT = 69.69;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT = 6.19;

  const TOTAL_GROSS_SHIPPING_PRICE_AFTER_DISCOUNT = 62.38;
  const TOTAL_NET_SHIPPING_PRICE_AFTER_DISCOUNT = 57.3;
  const TOTAL_TAX_SHIPPING_PRICE_AFTER_DISCOUNT = 5.08;

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
  it("creates order in channel pricesEnteredWithTax: True", async () => {
    await testCase
      .step("Create order in channel")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateDraftOrder)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:PricesWithTax",
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
        variantId: "$M{Product.Juice.variantId}",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderLinesCreate.orderLines[0].quantity", 10)
      .expectJson(
        "data.orderLinesCreate.order.total.gross.amount",
        TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
      );
  });
  it("should update order as staff user", async () => {
    await testCase
      .step("Update order as staff user")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(DraftOrderUpdateAddress)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:PricesWithTax:Address",
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
        "@DATA:TEMPLATE@": "DraftOrder:PricesWithTax:ShippingMethod",
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
        }),
      )
      .expectJson(
        "data.orderUpdateShipping.order.shippingPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_SHIPPING_PRICE,
          net: TOTAL_NET_SHIPPING_PRICE,
          tax: TOTAL_TAX_SHIPPING_PRICE,
        }),
      );
  });

  it("should add manual discount for total as staff user", async () => {
    await testCase
      .step("add manual discount to draft order")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(OrderDiscountAdd)
      .withGraphQLVariables({
        orderId: "$S{OrderID}",
        input: {
          reason: "manual discount for client",
          value: 10,
          valueType: "PERCENTAGE",
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderDiscountAdd.order.id", "$S{OrderID}")
      .expectJson(
        "data.orderDiscountAdd.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING_AFTER_DISCOUNT,
        }),
      )
      .expectJson(
        "data.orderDiscountAdd.order.shippingPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_SHIPPING_PRICE_AFTER_DISCOUNT,
          net: TOTAL_NET_SHIPPING_PRICE_AFTER_DISCOUNT,
          tax: TOTAL_TAX_SHIPPING_PRICE_AFTER_DISCOUNT,
        }),
      );
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
