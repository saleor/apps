import { afterEach, describe, expect, it, vi } from "vitest";

import { AppProblemCreateDocument, AppProblemDismissDocument } from "./graphql/documents";
import { ProblemsService } from "./problems-service";

function createMockClient(response: unknown) {
  return {
    mutation: vi.fn().mockReturnValue({
      toPromise: () => Promise.resolve(response),
    }),
  };
}

function createSchemaError() {
  return {
    graphQLErrors: [{ message: 'Cannot query field "appProblemCreate" on type "Mutation".' }],
    message: '[GraphQL] Cannot query field "appProblemCreate" on type "Mutation".',
  };
}

function createNetworkError() {
  return {
    graphQLErrors: [],
    message: "Network request failed",
  };
}

describe("ProblemsService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("reportProblem", () => {
    it("calls appProblemCreate mutation with correct input", async () => {
      const mockClient = createMockClient({
        data: { appProblemCreate: { errors: [] } },
      });
      const service = new ProblemsService({ client: mockClient });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
        aggregationPeriod: 1440,
        criticalThreshold: 1,
      };

      const result = await service.reportProblem(problem);

      expect(result.isOk()).toBe(true);
      expect(mockClient.mutation).toHaveBeenCalledWith(AppProblemCreateDocument, {
        input: {
          message: problem.message,
          key: problem.key,
          aggregationPeriod: problem.aggregationPeriod,
          criticalThreshold: problem.criticalThreshold,
        },
      });
    });

    it("sends undefined for optional fields when not set", async () => {
      const mockClient = createMockClient({
        data: { appProblemCreate: { errors: [] } },
      });
      const service = new ProblemsService({ client: mockClient });
      const problem = {
        key: "test:config-123:expiringSoon",
        message: "Certificate expiring soon",
      };

      const result = await service.reportProblem(problem);

      expect(result.isOk()).toBe(true);
      expect(mockClient.mutation).toHaveBeenCalledWith(AppProblemCreateDocument, {
        input: {
          message: problem.message,
          key: problem.key,
          aggregationPeriod: undefined,
          criticalThreshold: undefined,
        },
      });
    });

    it("returns GraphQL error when urql returns an error", async () => {
      const mockClient = createMockClient({ error: createNetworkError() });
      const service = new ProblemsService({
        client: mockClient,
        gracefullyHandleGraphqlSchemaError: false,
      });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
      };

      const result = await service.reportProblem(problem);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(ProblemsService.ProblemsServiceGraphQLError);
    });

    it("returns API error when Saleor returns errors field", async () => {
      const apiErrors = [{ field: null, message: "Not supported", code: "INVALID" }];
      const mockClient = createMockClient({
        data: { appProblemCreate: { errors: apiErrors } },
      });
      const service = new ProblemsService({ client: mockClient });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
      };

      const result = await service.reportProblem(problem);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(ProblemsService.ProblemsServiceAPIError);
    });

    it("returns GraphQL error when promise rejects", async () => {
      const mockClient = {
        mutation: vi.fn().mockReturnValue({
          toPromise: () => Promise.reject(new Error("Network error")),
        }),
      };
      const service = new ProblemsService({ client: mockClient });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
      };

      const result = await service.reportProblem(problem);

      expect(result.isErr()).toBe(true);
    });

    it("works without a logger", async () => {
      const mockClient = createMockClient({
        data: { appProblemCreate: { errors: [] } },
      });
      const service = new ProblemsService({ client: mockClient });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
      };

      const result = await service.reportProblem(problem);

      expect(result.isOk()).toBe(true);
    });

    it("calls logger.debug when reporting a problem", async () => {
      const mockClient = createMockClient({
        data: { appProblemCreate: { errors: [] } },
      });
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const service = new ProblemsService({ client: mockClient, logger: mockLogger });
      const problem = {
        key: "test:config-123:expired",
        message: "Certificate has expired",
        aggregationPeriod: 1440,
        criticalThreshold: 1,
      };

      await service.reportProblem(problem);

      expect(mockLogger.debug).toHaveBeenCalledWith("Reporting problem", {
        key: problem.key,
        aggregationPeriod: problem.aggregationPeriod,
        criticalThreshold: problem.criticalThreshold,
      });
    });
  });

  describe("dismissProblems", () => {
    it("calls appProblemDismiss mutation with keys", async () => {
      const mockClient = createMockClient({
        data: { appProblemDismiss: { errors: [] } },
      });
      const service = new ProblemsService({ client: mockClient });

      const result = await service.dismissProblems([
        "test:config-123:expired",
        "test:config-123:expiringSoon",
      ]);

      expect(result.isOk()).toBe(true);
      expect(mockClient.mutation).toHaveBeenCalledWith(AppProblemDismissDocument, {
        keys: ["test:config-123:expired", "test:config-123:expiringSoon"],
      });
    });

    it("returns GraphQL error when mutation fails", async () => {
      const mockClient = createMockClient({ error: createNetworkError() });
      const service = new ProblemsService({
        client: mockClient,
        gracefullyHandleGraphqlSchemaError: false,
      });

      const result = await service.dismissProblems(["test:config-123:expired"]);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(ProblemsService.ProblemsServiceGraphQLError);
    });

    it("returns API error when Saleor returns errors", async () => {
      const apiErrors = [{ field: null, message: "Not found", code: "NOT_FOUND" }];
      const mockClient = createMockClient({
        data: { appProblemDismiss: { errors: apiErrors } },
      });
      const service = new ProblemsService({ client: mockClient });

      const result = await service.dismissProblems(["test:config-123:expired"]);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(ProblemsService.ProblemsServiceAPIError);
    });
  });

  describe("gracefullyHandleGraphqlSchemaError", () => {
    describe("when true (default)", () => {
      it("returns ok(undefined) on GraphQL schema error for reportProblem", async () => {
        const mockClient = createMockClient({ error: createSchemaError() });
        const mockLogger = {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        };
        const service = new ProblemsService({ client: mockClient, logger: mockLogger });
        const problem = {
          key: "test:config-123:expired",
          message: "Certificate has expired",
        };

        const result = await service.reportProblem(problem);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBeUndefined();
        expect(mockLogger.warn).toHaveBeenCalledWith(
          "GraphQL schema does not support problems API (Saleor version may be too old). Skipping.",
          expect.objectContaining({ error: expect.anything() }),
        );
      });

      it("returns ok(undefined) on GraphQL schema error for dismissProblems", async () => {
        const mockClient = createMockClient({ error: createSchemaError() });
        const mockLogger = {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        };
        const service = new ProblemsService({ client: mockClient, logger: mockLogger });

        const result = await service.dismissProblems(["test:config-123:expired"]);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBeUndefined();
        expect(mockLogger.warn).toHaveBeenCalled();
      });

      it("still returns error for non-schema GraphQL errors", async () => {
        const mockClient = createMockClient({ error: createNetworkError() });
        const service = new ProblemsService({ client: mockClient });
        const problem = {
          key: "test:config-123:expired",
          message: "Certificate has expired",
        };

        const result = await service.reportProblem(problem);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBeInstanceOf(
          ProblemsService.ProblemsServiceGraphQLError,
        );
      });
    });

    describe("when false", () => {
      it("returns error on GraphQL schema error for reportProblem", async () => {
        const mockClient = createMockClient({ error: createSchemaError() });
        const service = new ProblemsService({
          client: mockClient,
          gracefullyHandleGraphqlSchemaError: false,
        });
        const problem = {
          key: "test:config-123:expired",
          message: "Certificate has expired",
        };

        const result = await service.reportProblem(problem);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBeInstanceOf(
          ProblemsService.ProblemsServiceGraphQLError,
        );
      });

      it("returns error on GraphQL schema error for dismissProblems", async () => {
        const mockClient = createMockClient({ error: createSchemaError() });
        const service = new ProblemsService({
          client: mockClient,
          gracefullyHandleGraphqlSchemaError: false,
        });

        const result = await service.dismissProblems(["test:config-123:expired"]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBeInstanceOf(
          ProblemsService.ProblemsServiceGraphQLError,
        );
      });
    });
  });
});
