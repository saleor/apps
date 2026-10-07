import { BaseError } from "@saleor/errors";
import { err, ok, type Result } from "neverthrow";
import { type Client, type CombinedError } from "urql";

import { AppSelfUpdateDeprecationDocument } from "../generated/graphql";

export const DeclareAppDeprecationError = BaseError.subclass("DeclareAppDeprecationError", {
  props: {
    _brand: "DeclareAppDeprecationError" as const,
  },
});

/**
 * Saleor below 3.23 has no `appSelfUpdate`. The document still parses there, so it is rejected
 * during validation — not as a `GraphQLSyntaxError`, but with code `GraphQLError`.
 *
 * That code alone also covers errors raised while resolving. Those carry a `path`; validation
 * errors never do, since nothing ran. The document is fixed and valid against 3.23+, so a
 * validation failure can only mean the mutation is missing.
 */
const isAppSelfUpdateMissing = (error: CombinedError) =>
  error.graphQLErrors.some((graphQLError) => {
    const exception = graphQLError.extensions?.exception as { code?: unknown } | undefined;

    return exception?.code === "GraphQLError" && !graphQLError.path;
  });

/**
 * The installation no longer exists: Saleor Cloud answers 404 for a deleted environment, and a
 * Saleor that dropped the app treats its token as anonymous, so `AUTHENTICATED_APP` is denied.
 * The mutation needs no other permission, so a denial cannot mean a misconfigured app.
 */
const isInstallationGone = (error: CombinedError) =>
  error.response?.status === 404 ||
  error.graphQLErrors.some(
    (graphQLError) =>
      (graphQLError.extensions?.exception as { code?: unknown } | undefined)?.code ===
      "PermissionDenied",
  );

/**
 * Declares the app deprecated on one installation, via `appSelfUpdate`. `client` must carry the
 * app's own token — the mutation needs no other permission.
 *
 * On a Saleor that predates the mutation (below 3.23) the result is `"unsupported"`, and for an
 * installation that no longer exists it is `"gone"` — neither is an error.
 *
 * Idempotent by design: Saleor compares the incoming reason to the stored one and skips the
 * write when they match, so re-running this costs a no-op round trip. Saleor truncates the reason
 * past 2048 characters and stores it verbatim — pass plain text.
 */
export const declareAppDeprecation = async (
  client: Client,
  reason: string,
  { timeoutMs }: { timeoutMs: number },
): Promise<
  Result<"updated" | "unsupported" | "gone", InstanceType<typeof DeclareAppDeprecationError>>
> => {
  const { data, error } = await client
    .mutation(
      AppSelfUpdateDeprecationDocument,
      { deprecationReason: reason },
      /*
       * Overriding `fetch` rather than `fetchOptions`: per-operation `fetchOptions` would replace
       * the client's, dropping its User-Agent header.
       */
      {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.any(
              [init?.signal, AbortSignal.timeout(timeoutMs)].filter((signal) => !!signal),
            ),
          }),
      },
    )
    .toPromise();

  if (error) {
    if (isAppSelfUpdateMissing(error)) {
      return ok("unsupported");
    }

    if (isInstallationGone(error)) {
      return ok("gone");
    }

    return err(new DeclareAppDeprecationError(error.message, { cause: error }));
  }

  const errors = data?.appSelfUpdate?.errors ?? [];

  if (errors.length) {
    return err(
      new DeclareAppDeprecationError(errors[0].message ?? "Unknown appSelfUpdate error", {
        props: { code: errors[0].code },
      }),
    );
  }

  return ok("updated");
};
