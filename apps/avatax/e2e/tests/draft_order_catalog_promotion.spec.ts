import { e2e } from "pactum";
import { describe, it } from "vitest";

import { env } from "../../src/env";
import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateAddress,
  DraftOrderUpdateShippingMethod,
  StaffUserTokenCreate,
} from "../generated/graphql";
import { getCompleteMoney, getMoney } from "../utils/moneyUtils";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=4846&case_id=18388
describe("App should calculate taxes on draft order with products on catalog promotion TC: AVATAX_24", () => {
  const testCase = e2e(
    "Draft order with products on catalog promotion [pricesEnteredWithTax: True]",
  );
  const staffCredentials = {
    email: env.E2E_USER_NAME,
    password: env.E2E_USER_PASSWORD,
  };

  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 328.22;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 301.46;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 26.76;

  const SHIPPING_GROSS_PRICE = 69.31;
  const SHIPPING_NET_PRICE = 63.66;
  const SHIPPING_TAX_PRICE = 5.65;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 397.53;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 365.11;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 32.42;

  const UNDISCOUNTED_TOTAL_GROSS_PRICE_AFTER_SHIPPING = 414.81;
  const UNDISCOUNTED_TOTAL_NET_PRICE_AFTER_SHIPPING = 381;
  const UNDISCOUNTED_TOTAL_TAX_PRICE_AFTER_SHIPPING = 33.81;

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
            variantId: "$M{Product.ProductOnCatalogPromotion.variantId}",
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
        getMoney(TOTAL_GROSS_PRICE_BEFORE_SHIPPING, CURRENCY),
      );
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
          gross: UNDISCOUNTED_TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: UNDISCOUNTED_TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: UNDISCOUNTED_TOTAL_TAX_PRICE_AFTER_SHIPPING,
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
