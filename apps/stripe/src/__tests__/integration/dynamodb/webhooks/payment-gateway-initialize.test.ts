import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import * as manifestHandlers from "@/app/api/webhooks/saleor/payment-gateway-initialize-session/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { dynamoDbAplEntity } from "@/modules/apl/apl-db-model";
import { DynamoAPLRepository } from "@/modules/apl/dynamo-apl-repository";
import { DynamoAPL } from "@/modules/apl/dynamodb-apl";

const realSaleorApiUrl = "https://hackathon-shipping.eu.saleor.cloud/graphql/";

describe("PaymentGatewayInitialize webhook: integration", async () => {
  beforeEach(async () => {});

  /**
   * Verify snapshot - if your changes cause manifest to be different, ensure changes are expected
   */
  it("TEST", async () => {
    // todo looks like it's not called for some reason
    vi.spyOn(verifyWebhookSignatureModule, "verifyWebhookSignature").mockImplementation(
      async () => {
        console.log("I should be called");
      },
    );

    const apl = new DynamoAPL({
      repository: new DynamoAPLRepository({
        entity: dynamoDbAplEntity,
      }),
    });

    vi.spyOn(apl, "set");

    await apl.set({
      saleorApiUrl: realSaleorApiUrl,
      appId: mockedSaleorAppId,
      token: "mocked-token",
      jwks: "{}",
    });

    await testApiHandler({
      appHandler: manifestHandlers,
      async test({ fetch }) {
        const body = await fetch({
          method: "POST",
          body: JSON.stringify({}), //todo fill payload
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "payment_gateway_initialize_session",
            "saleor-signature": "mock-signature",
          }),
        }).then((r) => r.json());

        console.log(body);
      },
    });
  });
});
