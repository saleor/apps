import { e2e } from "pactum";
import { describe, it } from "vitest";

import { envE2e } from "../env-e2e";
import {
  CreateDraftOrder,
  DraftOrderComplete,
  DraftOrderUpdateShippingMethod,
  StaffUserTokenCreate,
  UpdatePrivateMetadata,
} from "../generated/graphql";
import { getCompleteMoney } from "../utils/money";

// Test for shipFrom address private metadata override functionality on draft orders
describe("App should use shipFrom address from private metadata on draft order TC: AVATAX_SHIP_FROM_DRAFT", () => {
  const testCase = e2e(
    "Draft order with avataxShipFromAddress private metadata - WA origin (no tax) vs CA default",
  );

  const staffCredentials = {
    email: envE2e.E2E_USER_NAME as string,
    password: envE2e.E2E_USER_PASSWORD as string,
  };

  const shipFromAddressMetadata = [
    {
      key: "avataxShipFromAddress",
      value: JSON.stringify({
        street: "456 Draft Ship Street",
        city: "Seattle",
        state: "WA", // Washington has no state sales tax - should significantly reduce tax amounts
        zip: "98101",
        country: "US",
      }),
    },
  ];

  const CURRENCY = "USD";
  /*
   * Expected values when shipping FROM Washington (no state sales tax)
   * These should be significantly lower than the default CA values
   */
  const TOTAL_GROSS_PRICE_BEFORE_SHIPPING = 15;
  const TOTAL_NET_PRICE_BEFORE_SHIPPING = 15; // No tax on products when shipping from WA
  const TOTAL_TAX_PRICE_BEFORE_SHIPPING = 0;

  const TOTAL_GROSS_SHIPPING_PRICE = 69.31;
  const TOTAL_NET_SHIPPING_PRICE = 69.31; // No tax on shipping when shipping from WA
  const TOTAL_TAX_SHIPPING_PRICE = 0;

  const TOTAL_GROSS_PRICE_AFTER_SHIPPING = 84.31;
  const TOTAL_NET_PRICE_AFTER_SHIPPING = 84.31; // No tax when shipping from WA
  const TOTAL_TAX_PRICE_AFTER_SHIPPING = 0;

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

  it("creates draft order with lines and addresses", async () => {
    await testCase
      .step("Create draft order with lines and addresses")
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

  it("should apply the shipFrom address private metadata to the draft order", async () => {
    await testCase
      .step("Update draft order with shipFrom address private metadata")
      .spec()
      .post("/graphql/")
      .withGraphQLQuery(UpdatePrivateMetadata)
      .withGraphQLVariables({
        id: "$S{OrderID}",
        input: shipFromAddressMetadata,
      })
      .withHeaders({
        Authorization: "Bearer $S{StaffUserToken}",
      })
      .expectStatus(200)
      .expectJson("data.updatePrivateMetadata.item.privateMetadata", shipFromAddressMetadata);
  });

  it("should update shipping method and calculate shipping price with custom shipFrom address", async () => {
    await testCase
      .step("Update shipping method with custom shipFrom address")
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

  it("should complete draft order with custom shipFrom address", async () => {
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
      .expectJson("data.draftOrderComplete.order.id", "$S{OrderID}")
      .expectJson(
        "data.draftOrderComplete.order.total",
        getCompleteMoney({
          gross: TOTAL_GROSS_PRICE_AFTER_SHIPPING,
          net: TOTAL_NET_PRICE_AFTER_SHIPPING,
          tax: TOTAL_TAX_PRICE_AFTER_SHIPPING,
          currency: CURRENCY,
        }),
      )
      .expectJson(
        "data.draftOrderComplete.order.shippingPrice",
        getCompleteMoney({
          gross: TOTAL_GROSS_SHIPPING_PRICE,
          net: TOTAL_NET_SHIPPING_PRICE,
          tax: TOTAL_TAX_SHIPPING_PRICE,
          currency: CURRENCY,
        }),
      );
  });
});
