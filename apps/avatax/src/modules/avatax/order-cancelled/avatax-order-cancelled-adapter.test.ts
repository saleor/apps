import { err } from "neverthrow";
import { describe, expect, it } from "vitest";

import { AvataxConfigMockGenerator } from "@/modules/avatax/avatax-config-mock-generator";
import { AvataxOrderCancelledAdapter } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderCancelledPayloadTransformer } from "@/modules/avatax/order-cancelled/avatax-order-cancelled-payload-transformer";
import { AvataxEntityNotFoundError } from "@/modules/taxes/tax-error";

describe("AvataxOrderCancelledAdapter", () => {
  it("Throws DocumentNotFoundError if Avatax returns AvataxEntityNotFoundError from the response of transaction void", async () => {
    const adapter = new AvataxOrderCancelledAdapter(
      {
        async voidTransaction() {
          return Promise.resolve(
            err(new AvataxEntityNotFoundError("AvaTax didnt find the document to void")),
          );
        },
      },
      new AvataxOrderCancelledPayloadTransformer(),
    );

    try {
      await adapter.send({ avataxId: "1" }, new AvataxConfigMockGenerator().generateAvataxConfig());
    } catch (e) {
      // console.log("Error", e);
      return expect(e).toBeInstanceOf(AvataxOrderCancelledAdapter.DocumentNotFoundError);
    }
  });
});
