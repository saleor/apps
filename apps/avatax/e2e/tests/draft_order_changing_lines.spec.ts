import { e2e } from "pactum";
import { describe, it } from "vitest";

import { env } from "../../src/env";
import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateShippingMethod,
  OrderLineDelete,
  OrderLineUpdate,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=4846&pagination_current=2&case_id=18390
describe("App should calculate taxes on draft order when changing lines TC: AVATAX_26", () => {
  const testCase = e2e("Changing lines on draft order [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: env.E2E_USER_NAME,
    password: env.E2E_USER_PASSWORD,
  };

  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_ONE_LINE = 15;
  const TOTAL_NET_PRICE_ONE_LINE = 13.78;
  const TOTAL_TAX_PRICE_ONE_LINE = 1.22;

  const TOTAL_GROSS_PRICE_THREE_LINES = 344.5;
  const TOTAL_NET_PRICE_THREE_LINE = 316.43;
  const TOTAL_TAX_PRICE_THREE_LINE = 28.07;

  const TOTAL_GROSS_PRICE_AFTER_REMOVING_LINE = 45;
  const TOTAL_NET_PRICE_AFTER_REMOVING_LINE = 41.34;
  const TOTAL_TAX_PRICE_AFTER_REMOVING_LINE = 3.66;

  const TOTAL_GROSS_PRICE_AFTER_CHANGING_QUANTITY = 34.5;
  const TOTAL_NET_PRICE_AFTER_CHANGING_QUANTITY = 31.68;
  const TOTAL_TAX_PRICE_AFTER_CHANGING_QUANTITY = 2.82;

  const TOTAL_GROSS_SHIPPING_PRICE = 69.31;
  const TOTAL_NET_SHIPPING_PRICE = 63.65;
  const TOTAL_TAX_SHIPPING_PRICE = 5.66;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 103.81;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 95.34;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 8.47;

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
  it("creates order with lines and addresses", async () => {
    await testCase
      .step("Create order with lines and addressess")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateDraftOrder)
      .withGraphQLVariables({
        "@DATA:TEMPLATE@": "DraftOrder:LinesAndAddresses",
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
      .expectJson(
        "data.draftOrderCreate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_ONE_LINE,
          net: TOTAL_NET_PRICE_ONE_LINE,
          tax: TOTAL_TAX_PRICE_ONE_LINE,
          currency: CURRENCY,
        }),
      )
      .stores("OrderID", "data.draftOrderCreate.order.id")
      .stores("FirstOrderLineID", "data.draftOrderCreate.order.lines[0].id");
  });
  it("should add another lines to draft order", async () => {
    await testCase
      .step("Add new products to order")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(CreateOrderLines)
      .withGraphQLVariables({
        orderId: "$S{OrderID}",
        input: [
          { quantity: 1, variantId: "$M{Product.Regular.variantId}" },
          { quantity: 1, variantId: "$M{Product.ExpensiveTshirt.variantId}" },
        ],
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJsonLength("data.orderLinesCreate.order.lines", 3)
      .expectJson(
        "data.orderLinesCreate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_THREE_LINES,
          net: TOTAL_NET_PRICE_THREE_LINE,
          tax: TOTAL_TAX_PRICE_THREE_LINE,
          currency: CURRENCY,
        }),
      )
      .stores("SecondOrderLineID", "data.orderLinesCreate.order.lines[1].id")
      .stores("ThirdOrderLineID", "data.orderLinesCreate.order.lines[2].id");
  });
  //remove line
  it("should remove line from order", async () => {
    await testCase
      .step("Remove line from order")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(OrderLineDelete)
      .withGraphQLVariables({
        lineId: "$S{ThirdOrderLineID}",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJsonLength("data.orderLineDelete.order.lines", 2)
      .expectJson(
        "data.orderLineDelete.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_REMOVING_LINE,
          net: TOTAL_NET_PRICE_AFTER_REMOVING_LINE,
          tax: TOTAL_TAX_PRICE_AFTER_REMOVING_LINE,
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
        lineId: "$S{FirstOrderLineID}",
        input: {
          quantity: 3,
        },
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.orderLineUpdate.order.id", "$S{OrderID}")
      .expectJson(
        "data.orderLineUpdate.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_CHANGING_QUANTITY,
          net: TOTAL_NET_PRICE_AFTER_CHANGING_QUANTITY,
          tax: TOTAL_TAX_PRICE_AFTER_CHANGING_QUANTITY,
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
          gross: TOTAL_GROSS_SHIPPING_PRICE,
          net: TOTAL_NET_SHIPPING_PRICE,
          tax: TOTAL_TAX_SHIPPING_PRICE,
          currency: CURRENCY,
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
