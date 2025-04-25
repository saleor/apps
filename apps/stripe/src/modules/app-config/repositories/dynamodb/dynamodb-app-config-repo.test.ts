import { describe, it } from "vitest";

describe("DynamodbAppConfigRepo", () => {
  describe("getRootConfig", () => {
    it.todo("Returns valid RootAppConfig with entries from database");
    it.todo("Returns FailureFetchingConfig if DB connection fails");
  });

  describe("getStripeConfig", () => {
    it.todo("Returns null if entry not found in DB");
    it.todo("Returns valid StripeConfig if entry found in DB");
    it.todo("Returns FailureFetchingConfig if DB connection fails");
  });

  describe("saveStripeConfig", () => {
    it.todo("Saves config to DB by calling method on entity");
    it.todo("Returns FailureSavingConfig if DB connection fails");
  });
  describe("updateMapping", () => {
    it.todo("Saves config to DB by calling method on entity");
    it.todo("Returns FailureSavingConfig if DB connection fails");
  });
});
