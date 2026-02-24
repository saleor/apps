import { BaseError } from "@saleor/errors";
import { err, ok, type Result } from "neverthrow";
import semver from "semver/preload";
import { type Client } from "urql";

import {
  AppProblemCreateDocument,
  type AppProblemCreateInput,
  AppProblemDismissByKeyDocument,
} from "../generated/graphql";

export const AppProblemsReporterError = BaseError.subclass("AppProblemsReporterError", {
  props: {
    _brand: "AppProblemsReporterError" as const,
  },
});

export class AppProblemsReporter {
  constructor(private client: Client) {}

  /**
   * https://github.com/saleor/saleor/releases/tag/3.22.36
   */
  private static MINIMAL_SALEOR_VERSION = "3.22.36";

  /**
   * Verifies if Saleor version has this API implemented
   */
  static isApiCompatible(semverString: string) {
    return semver.compare(semverString, this.MINIMAL_SALEOR_VERSION) >= 0;
  }

  async reportProblem(
    input: AppProblemCreateInput,
  ): Promise<Result<void, InstanceType<typeof AppProblemsReporterError>>> {
    const { data, error } = await this.client
      .mutation(AppProblemCreateDocument, { input })
      .toPromise();

    if (error) {
      return err(new AppProblemsReporterError(error.message, { cause: error }));
    }

    if (data?.appProblemCreate?.errors.length) {
      return err(
        new AppProblemsReporterError(data.appProblemCreate.errors[0].message ?? "Unknown error"),
      );
    }

    return ok(undefined);
  }

  async clearProblems(
    keys: string[],
  ): Promise<Result<void, InstanceType<typeof AppProblemsReporterError>>> {
    const { data, error } = await this.client
      .mutation(AppProblemDismissByKeyDocument, { keys })
      .toPromise();

    if (error) {
      return err(new AppProblemsReporterError(error.message, { cause: error }));
    }

    if (data?.appProblemDismiss?.errors.length) {
      return err(
        new AppProblemsReporterError(data.appProblemDismiss.errors[0].message ?? "Unknown error"),
      );
    }

    return ok(undefined);
  }
}
