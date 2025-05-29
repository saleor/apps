import { e2e } from "pactum";
import { describe, it } from "vitest";

import { env } from "../../src/env";
import {
  CreateDraftOrder,
  DraftOrderComplete,
  DraftOrderUpdateShippingMethod,
  StaffUserTokenCreate,
  UpdateMetadata,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/money";

// Testmo: https://saleor.testmo.net/repositories/6?group_id=4846&case_id=24363
describe("App should exempt taxes on draft order with metadata avataxEntityCode TC: AVATAX_36", () => {
  const testCase = e2e("draft order with avataxEntityCode [pricesEnteredWithTax: True]");
  const staffCredentials = {
    email: env.E2E_USER_NAME as string,
    password: env.E2E_USER_PASSWORD as string,
  };

  const metadata = [
    {
      key: "avataxEntityCode",
      value: "A",
    },
  ];
  const CURRENCY = "USD";
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 13.78;
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 1.22;

  const TOTAL_GROSS_SHIPPING_PRICE = 69.31;
  const TOTAL_NET_SHIPPING_PRICE = 63.65;
  const TOTAL_TAX_SHIPPING_PRICE = 5.66;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 77.43;
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 6.88;

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
          gross: TOTAL_GROSS_PRICE_BEFORE_SHIPPING,
          net: TOTAL_NET_PRICE_BEFORE_SHIPPING,
          tax: TOTAL_TAX_PRICE_BEFORE_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .stores("OrderID", "data.draftOrderCreate.order.id");
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
  it("should apply the entity code metadata to the draft order", async () => {
    await testCase
      .step("Update draft order metadata")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(UpdateMetadata)
      .withGraphQLVariables({
        id: "$S{OrderID}",
        input: metadata,
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.updateMetadata.item.metadata", metadata);
  });
  it("should update order to recalculate taxes after applying the metadata", async () => {
    await testCase
      .step("Update shipping method to recalculate taxes")
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
          net: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          tax: 0,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.orderUpdateShipping.order.shippingPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_SHIPPING_PRICE,
          net: TOTAL_GROSS_SHIPPING_PRICE,
          tax: 0,
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
