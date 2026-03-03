import { BaseError } from "@saleor/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { type CombinedError } from "urql";

import { AppProblemCreateDocument, AppProblemDismissDocument } from "./graphql/documents";
import { type AppProblemError } from "./graphql/types";
import { type ProblemDefinition } from "./problem-definition";
import { type ProblemsLogger, type UrqlMutationClient } from "./types";

const noopLogger: ProblemsLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

function isGraphQLSchemaError(error: CombinedError): boolean {
  return error.graphQLErrors.some(
    (gqlError) =>
      gqlError.message.includes("Cannot query field") ||
      gqlError.message.includes("Unknown field") ||
      gqlError.message.includes("Unknown type") ||
      gqlError.message.includes("Unknown argument"),
  );
}

export class ProblemsService {
  static ProblemsServiceError = BaseError.subclass("ProblemsServiceError");
  static ProblemsServiceGraphQLError = this.ProblemsServiceError.subclass(
    "ProblemsServiceGraphQLError",
    {
      props: { urqlClientError: {} as CombinedError },
    },
  );
  static ProblemsServiceAPIError = this.ProblemsServiceError.subclass("ProblemsServiceAPIError", {
    props: { apiErrors: {} as readonly AppProblemError[] },
  });

  private client: UrqlMutationClient;
  private logger: ProblemsLogger;
  private gracefullyHandleGraphqlSchemaError: boolean;

  constructor(deps: {
    client: UrqlMutationClient;
    logger?: ProblemsLogger;
    gracefullyHandleGraphqlSchemaError?: boolean;
  }) {
    this.client = deps.client;
    this.logger = deps.logger ?? noopLogger;
    this.gracefullyHandleGraphqlSchemaError = deps.gracefullyHandleGraphqlSchemaError ?? true;
  }

  reportProblem(problem: ProblemDefinition) {
    this.logger.debug("Reporting problem", {
      key: problem.key,
      aggregationPeriod: problem.aggregationPeriod,
      criticalThreshold: problem.criticalThreshold,
    });

    return ResultAsync.fromPromise(
      this.client
        .mutation(AppProblemCreateDocument, {
          input: {
            message: problem.message,
            key: problem.key,
            aggregationPeriod: problem.aggregationPeriod,
            criticalThreshold: problem.criticalThreshold,
          },
        })
        .toPromise(),
      (error) => ProblemsService.ProblemsServiceGraphQLError.normalize(error),
    ).andThen((result) => {
      if (result.error) {
        if (
          this.gracefullyHandleGraphqlSchemaError &&
          isGraphQLSchemaError(result.error as CombinedError)
        ) {
          this.logger.warn(
            "GraphQL schema does not support problems API (Saleor version may be too old). Skipping.",
            { error: result.error },
          );

          return ok(undefined);
        }

        return err(
          new ProblemsService.ProblemsServiceGraphQLError(
            "Saleor returned error while reporting problem",
            { cause: result.error, props: { urqlClientError: result.error as CombinedError } },
          ),
        );
      }

      const apiErrors = result.data?.appProblemCreate?.errors ?? [];

      if (apiErrors.length > 0) {
        return err(
          new ProblemsService.ProblemsServiceAPIError(
            "Saleor returned API errors while reporting problem",
            { cause: apiErrors, props: { apiErrors } },
          ),
        );
      }

      return ok(undefined);
    });
  }

  dismissProblems(keys: string[]) {
    this.logger.debug("Dismissing problems", { keys });

    return ResultAsync.fromPromise(
      this.client.mutation(AppProblemDismissDocument, { keys }).toPromise(),
      (error) => ProblemsService.ProblemsServiceGraphQLError.normalize(error),
    ).andThen((result) => {
      if (result.error) {
        if (
          this.gracefullyHandleGraphqlSchemaError &&
          isGraphQLSchemaError(result.error as CombinedError)
        ) {
          this.logger.warn(
            "GraphQL schema does not support problems API (Saleor version may be too old). Skipping.",
            { error: result.error },
          );

          return ok(undefined);
        }

        return err(
          new ProblemsService.ProblemsServiceGraphQLError(
            "Saleor returned error while dismissing problems",
            { cause: result.error, props: { urqlClientError: result.error as CombinedError } },
          ),
        );
      }

      const apiErrors = result.data?.appProblemDismiss?.errors ?? [];

      if (apiErrors.length > 0) {
        return err(
          new ProblemsService.ProblemsServiceAPIError(
            "Saleor returned API errors while dismissing problems",
            { cause: apiErrors, props: { apiErrors } },
          ),
        );
      }

      return ok(undefined);
    });
  }
}
