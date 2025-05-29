import { e2e } from "pactum";
import { describe, it } from "vitest";

import { env } from "../../src/env";
import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateAddress,
  DraftOrderUpdateShippingMethod,
  OrderLineUpdate,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney, getMoney } from "../utils/money";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=4846&case_id=24175
describe("App should calculate taxes on draft order when order promotion is applied TC: AVATAX_32", () => {
  const testCase = e2e("Draft order with order promotion, [pricesEnteredWithTax: False]");
  const staffCredentials = {
    email: env.E2E_USER_NAME,
    password: env.E2E_USER_PASSWORD,
  };

  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 326.08;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 299.5;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 26.58;

  const SHIPPING_GROSS_PRICE = 75.46;
  const SHIPPING_NET_PRICE = 69.31;
  const SHIPPING_TAX_PRICE = 6.15;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 401.54;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 368.81;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 32.73;

  const PRODUCT_TOTAL_GROSS_PRICE_AFTER_PROMOTION = 489.12;
  const PRODUCT_TOTAL_NET_PRICE_AFTER_PROMOTION = 449.25;
  const PRODUCT_TOTAL_TAX_PRICE_AFTER_PROMOTION = 39.87;

  const TOTAL_GROSS_PRICE_INCLUDING_ORDER_PROMOTION = 564.58;
  const TOTAL_NET_PRICE_INCLUDING_ORDER_PROMOTION = 518.56;
  const TOTAL_TAX_PRICE_INCLUDING_ORDER_PROMOTION = 46.02;

  const UNDISCOUNTE_TOTAL_GROSS_PRICE = 727.62;
  const UNDISCOUNTE_TOTAL_NET_PRICE = 668.31;
  const UNDISCOUNTE_TOTAL_TAX_PRICE = 59.31;

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
  it("should add lines to draft order", async () => {
    await testCase
      .step("add prodcuts")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateOrderLines)
      .withGraphQLVariables({
        orderId: "$S{OrderID}",
        input: [
          {
            quantity: 1,
            variantId: "$M{Product.ExpensiveTshirt.variantId}",
          },
        ],
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderLinesCreate.orderLines[0].quantity", 1)
      .expectJson(
        "data.orderLinesCreate.order.total.gross",
        getMoney(TOTAL_NET_PRICE_BEFORE_SHIPPING, CURRENCY),
      )
      .stores("OrderLineId", "data.orderLinesCreate.orderLines[0].id");
  });
  it("should update order address", async () => {
    await testCase
      .step("Update addresses on draft order")
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

  it("should update order's shipping method", async () => {
    await testCase
      .step("Add shipping method")
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
      )
      .expectJson(
        "data.orderUpdateShipping.order.undiscountedTotal",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      );
  });

  it("should update order line", async () => {
    await testCase
      .step("Update order line")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(OrderLineUpdate)
      .withGraphQLVariables({
        lineId: "$S{OrderLineId}",
        input: {
          quantity: 2,
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderLineUpdate.order.id", "$S{OrderID}")
      .expectJson(
        "data.orderLineUpdate.order.lines[0].totalPrice",
        getCompleteMoney({
          gross: PRODUCT_TOTAL_GROSS_PRICE_AFTER_PROMOTION,
          net: PRODUCT_TOTAL_NET_PRICE_AFTER_PROMOTION,
          tax: PRODUCT_TOTAL_TAX_PRICE_AFTER_PROMOTION,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.orderLineUpdate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_INCLUDING_ORDER_PROMOTION,
          net: TOTAL_NET_PRICE_INCLUDING_ORDER_PROMOTION,
          tax: TOTAL_TAX_PRICE_INCLUDING_ORDER_PROMOTION,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.orderLineUpdate.order.shippingPrice",
        getCompleteMoney({
          gross: SHIPPING_GROSS_PRICE,
          net: SHIPPING_NET_PRICE,
          tax: SHIPPING_TAX_PRICE,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.orderLineUpdate.order.undiscountedTotal",
        getCompleteMoney({
          gross: UNDISCOUNTE_TOTAL_GROSS_PRICE,
          net: UNDISCOUNTE_TOTAL_NET_PRICE,
          tax: UNDISCOUNTE_TOTAL_TAX_PRICE,
          currency: CURRENCY,
        }),
      )
      .expectJson("data.orderLineUpdate.order.discounts[0].type", "ORDER_PROMOTION");
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
