/* eslint-disable turbo/no-undeclared-env-vars */
import { e2e } from "pactum";
import { describe, it } from "vitest";
import {
  CreateDraftOrder,
  CreateOrderLines,
  DraftOrderComplete,
  DraftOrderUpdateAddress,
  DraftOrderUpdateShippingMethod,
  OrderDetails,
  StaffUserTokenCreate,
} from "../generated/graphql";

describe("App should calculates taxes for order with product with tax calss [pricesEnteredWithTax: True]", () => {
  const testCase = e2e("Product with tax class [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: process.env.E2E_USER_NAME as string,
    password: process.env.E2E_USER_PASSWORD as string,
  };

  const CURRENCY = "USD";

  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const TOTAL_GROSS_SHIPPING_PRICE = 69.31;
  const TOTAL_NET_SHIPPING_PRICE = 63.66;
  const TOTAL_TAX_SHIPPING_PRICE = 5.65;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.44;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.87;

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
      .stores("StaffUserToken", "data.tokenCreate.token");
  });
  it("creates order with product with tax class", async () => {
    await testCase
      .step("Create order with product with tax class")
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
        "data.draftOrderUpdate.order.total.gross.amount",
        TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
      )
      .expectJson("data.draftOrderUpdate.order.total.tax.amount", TOTAL_TAX_PRICE_BEFORE_SHIPPING)
      .expectJson("data.draftOrderUpdate.order.total.net.amount", TOTAL_NET_PRICE_BEFORE_SHIPPING);
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
      .expectJsonLike({
        data: {
          orderUpdateShipping: {
            order: {
              total: {
                gross: {
                  amount: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
                net: {
                  amount: TOTAL_NET_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
                tax: {
                  amount: TOTAL_TAX_PRICE_AFTER_SHIPPING,
                  currency: CURRENCY,
                },
              },
              shippingPrice: {
                gross: {
                  amount: TOTAL_GROSS_SHIPPING_PRICE,
                  currency: CURRENCY,
                },
                net: {
                  amount: TOTAL_NET_SHIPPING_PRICE,
                  currency: CURRENCY,
                },
                tax: {
                  amount: TOTAL_TAX_SHIPPING_PRICE,
                  currency: CURRENCY,
                },
              },
            },
          },
        },
      });
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

  it("should have metadata with 'avataxId' key", async () => {
    await testCase
      .step("Check if order has metadata with 'avataxId' key")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(OrderDetails)
      .withGraphQLVariables({
        id: "$S{OrderID}",
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJsonLike("data.order.metadata[key=avataxId]", {
        key: "avataxId",
        value: "typeof $V === 'string'",
      })
      .retry(4, 2000);
  });
});
