import { describe, expect, it } from "vitest";

import { AvataxConfigMockGenerator } from "@/modules/avatax/avatax-config-mock-generator";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderCancelledPayloadTransformer } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-payload-transformer";

describe("AvataxOrderCancelledAdapter", () => {
  it("Throws DocumentNotFoundError if Avatax returns DocumentNotFoundError from the response of transaction void", async () => {
    const adapter = new AvataxOrderCancelledAdapter(
      {
        async voidTransaction() {
          throw {
            code: "EntityNotFoundError",
            details: [{}],
          };
        },
      },
      new AvataxOrderCancelledPayloadTransformer(),
    );

    try {
      await adapter.send({ avataxId: "1" }, new AvataxConfigMockGenerator().generateAvataxConfig());
    } catch (e) {
      return expect(e).toBeInstanceOf(AvataxOrderCancelledAdapter.DocumentNotFoundError);
    }
  });
});
