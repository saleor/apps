import { describe, it, vi, expect } from "vitest";
import { AvataxClient } from "./avatax-client";
import Avatax from "avatax";

class MockAvatax extends Avatax {
  constructor() {
    super({
      appName: "test",
      appVersion: "1",
      machineName: "test",
      environment: "sandbox",
      timeout: 5000,
    });
  }
  withSecurity() {
    return this;
  }

  async createOrAdjustTransaction() {
    return {};
  }

  async voidTransaction() {
    return {};
  }
}

describe("Avatax Client", () => {
  describe("createTransaction", () => {
    it("Transforms error (rejected promise) from Avatax to custom error wrapped in Error Result", async () => {
      const mockedAvatax = new MockAvatax();

      mockedAvatax.createOrAdjustTransaction = vi
        .fn()
        .mockRejectedValue(new Error("Some error from Avatax"));

      const client = new AvataxClient(
        {
          isSandbox: true,
          credentials: {
            username: "foo",
            password: "bar",
          },
        },
        {
          avataxClient: mockedAvatax,
        },
      );

      const result = await client.createTransaction({
        model: {
          companyCode: "foo",
          customerCode: "test",
          date: new Date(),
          lines: [
            {
              amount: 1,
            },
          ],
        },
      });

      console.log(result);

      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        "[CreateTransactionError: Some error from Avatax]",
      );
    });
  });

  describe("voidTransaction", () => {
    it("Transforms error (rejected promise) from Avatax to custom error wrapped in Error Result", async () => {
      const mockedAvatax = new MockAvatax();

      mockedAvatax.voidTransaction = vi.fn().mockRejectedValue(new Error("Some error from Avatax"));

      const client = new AvataxClient(
        {
          isSandbox: true,
          credentials: {
            username: "foo",
            password: "bar",
          },
        },
        {
          avataxClient: mockedAvatax,
        },
      );

      const result = await client.voidTransaction({
        transactionCode: "foo",
        companyCode: "foo",
      });

      console.log(result);

      expect(result.isErr()).toBeTruthy();
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        "[VoidTransactionError: Some error from Avatax]",
      );
    });
  });
});
