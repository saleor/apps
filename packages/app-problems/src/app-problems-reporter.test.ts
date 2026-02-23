import { Client, CombinedError } from "urql";
import { describe, expect, it, vi } from "vitest";

import { AppProblemCreateDocument, AppProblemDismissByKeyDocument } from "../generated/graphql";
import { AppProblemsReporter, AppProblemsReporterError } from "./app-problems-reporter";

function createMockClient(mutation: ReturnType<typeof vi.fn>): Client {
  return { mutation: mutation as unknown as Client["mutation"] } as Client;
}

function mockMutationResponse(mutation: ReturnType<typeof vi.fn>, data: unknown) {
  mutation.mockReturnValueOnce({
    toPromise: async () => ({ data, error: undefined }),
  });
}

function mockMutationError(mutation: ReturnType<typeof vi.fn>, error: CombinedError) {
  mutation.mockReturnValueOnce({
    toPromise: async () => ({ data: undefined, error }),
  });
}

describe("AppProblemsReporter", () => {
  describe("reportProblem", () => {
    it("calls AppProblemCreate mutation with provided input and returns ok", async () => {
      const mutation = vi.fn();

      mockMutationResponse(mutation, { appProblemCreate: { errors: [] } });

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.reportProblem({
        key: "tax-error",
        message: "Tax service unavailable",
      });

      expect(result.isOk()).toBe(true);
      expect(mutation).toHaveBeenCalledWith(AppProblemCreateDocument, {
        input: { key: "tax-error", message: "Tax service unavailable" },
      });
    });

    it("returns err with message when mutation returns GraphQL errors", async () => {
      const mutation = vi.fn();

      mockMutationResponse(mutation, {
        appProblemCreate: {
          errors: [{ message: "Invalid key", code: "INVALID", field: "key" }],
        },
      });

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.reportProblem({ key: "x", message: "test" });
      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AppProblemsReporterError);
      expect(error.message).toBe("Invalid key");
    });

    it("returns err when mutation returns transport error", async () => {
      const mutation = vi.fn();
      const networkError = new CombinedError({ networkError: new Error("Network failure") });

      mockMutationError(mutation, networkError);

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.reportProblem({ key: "test", message: "test" });
      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AppProblemsReporterError);
      expect(error.message).toContain("Network failure");
    });
  });

  describe("clearProblems", () => {
    it("calls AppProblemDismissByKey mutation with provided keys and returns ok", async () => {
      const mutation = vi.fn();

      mockMutationResponse(mutation, { appProblemDismiss: { errors: [] } });

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.clearProblems(["tax-error", "payment-error"]);

      expect(result.isOk()).toBe(true);
      expect(mutation).toHaveBeenCalledWith(AppProblemDismissByKeyDocument, {
        keys: ["tax-error", "payment-error"],
      });
    });

    it("returns err with message when mutation returns GraphQL errors", async () => {
      const mutation = vi.fn();

      mockMutationResponse(mutation, {
        appProblemDismiss: {
          errors: [{ message: "Not found", code: "NOT_FOUND", field: null }],
        },
      });

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.clearProblems(["unknown-key"]);
      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AppProblemsReporterError);
      expect(error.message).toBe("Not found");
    });

    it("returns err when mutation returns transport error", async () => {
      const mutation = vi.fn();
      const networkError = new CombinedError({ networkError: new Error("Network failure") });

      mockMutationError(mutation, networkError);

      const reporter = new AppProblemsReporter(createMockClient(mutation));

      const result = await reporter.clearProblems(["test"]);
      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AppProblemsReporterError);
      expect(error.message).toContain("Network failure");
    });
  });
});
