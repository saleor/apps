import { type Client, CombinedError } from "urql";
import { describe, expect, it, vi } from "vitest";

import { declareAppDeprecation } from "./declare-app-deprecation";

const REASON = "Replaced by another app.";

const OPTIONS = { timeoutMs: 1000 };

const createClient = (mutationResult: unknown) => {
  const mutation = vi.fn((_document: unknown, _variables: unknown, _context: unknown) => ({
    toPromise: () => Promise.resolve(mutationResult),
  }));

  return { client: { mutation } as unknown as Client, mutation };
};

/* What Saleor returns for a GraphQL-level failure, as urql surfaces it. */
const graphQLError = (message: string, code: string, path?: string[]) =>
  new CombinedError({ graphQLErrors: [{ message, path, extensions: { exception: { code } } }] });

describe("declareAppDeprecation", () => {
  it("Sends the given reason", async () => {
    const { client, mutation } = createClient({ data: { appSelfUpdate: { errors: [] } } });

    const result = await declareAppDeprecation(client, REASON, OPTIONS);

    expect(result._unsafeUnwrap()).toBe("updated");
    expect(mutation.mock.calls[0][1]).toStrictEqual({ deprecationReason: REASON });
  });

  /* Verbatim from a Saleor 3.22 instance: the document parses, then fails schema validation. */
  it("Reports a Saleor without appSelfUpdate as unsupported, not as an error", async () => {
    const { client } = createClient({
      error: graphQLError(
        'Cannot query field "appSelfUpdate" on type "Mutation". Did you mean "appUpdate", "pageUpdate", "addressUpdate", "orderUpdate" or "menuUpdate"?',
        "GraphQLError",
      ),
    });

    expect((await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrap()).toBe(
      "unsupported",
    );
  });

  /* Same code, but raised while resolving on a Saleor that has the mutation. */
  it("Reports a GraphQLError raised during execution as an error", async () => {
    const { client } = createClient({
      error: graphQLError("Something went wrong", "GraphQLError", ["appSelfUpdate"]),
    });

    expect(
      (await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrapErr().message,
    ).toContain("Something went wrong");
  });

  /* Saleor Cloud answers 404 for an environment that was deleted. */
  it("Reports a store that no longer exists as gone, not as an error", async () => {
    const { client } = createClient({
      error: new CombinedError({
        networkError: new Error("Not Found"),
        response: new Response(null, { status: 404, statusText: "Not Found" }),
      }),
    });

    expect((await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrap()).toBe("gone");
  });

  /* Verbatim from a Saleor that no longer has the app installed: its token is anonymous. */
  it("Reports an app token Saleor no longer accepts as gone, not as an error", async () => {
    const { client } = createClient({
      error: graphQLError(
        "To access this path, you need one of the following permissions: AUTHENTICATED_APP",
        "PermissionDenied",
        ["appSelfUpdate"],
      ),
    });

    expect((await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrap()).toBe("gone");
  });

  it("Reports any other GraphQL error as an error", async () => {
    const { client } = createClient({
      error: graphQLError("Internal Server Error", "InternalError"),
    });

    expect(
      (await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrapErr().message,
    ).toContain("Internal Server Error");
  });

  it("Aborts a request that outlives the timeout", async () => {
    const { client, mutation } = createClient({ data: { appSelfUpdate: { errors: [] } } });

    await declareAppDeprecation(client, REASON, { timeoutMs: 10 });

    const { fetch: timedFetch } = mutation.mock.calls[0][2] as { fetch: typeof fetch };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        (_input, init) =>
          new Promise(
            (_resolve, reject) =>
              init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)),
          ),
      );

    const request = timedFetch("https://shop.example.com/graphql/", {});

    await expect(request).rejects.toThrow(expect.objectContaining({ name: "TimeoutError" }));

    fetchSpy.mockRestore();
  });

  it("Reports a transport failure as an error", async () => {
    const { client } = createClient({
      error: new CombinedError({ networkError: new Error("Saleor is down") }),
    });

    expect(
      (await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrapErr().message,
    ).toContain("Saleor is down");
  });

  it("Reports a mutation error returned in the payload", async () => {
    const { client } = createClient({
      data: {
        appSelfUpdate: { errors: [{ field: null, message: "Invalid value", code: "INVALID" }] },
      },
    });

    expect(
      (await declareAppDeprecation(client, REASON, OPTIONS))._unsafeUnwrapErr().message,
    ).toContain("Invalid value");
  });
});
