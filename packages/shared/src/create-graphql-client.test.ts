// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { FetchAppDetailsDocument } from "../generated/graphql";
import { createGraphQLClient } from "./create-graphql-client";

const mockFetch = () =>
  vi.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify({ data: { shop: { name: "Shop" } } }), {
        headers: { "content-type": "application/json" },
      }),
  );

const getSentHeaders = (fetchSpy: ReturnType<typeof mockFetch>) =>
  (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;

describe("createGraphQLClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends User-Agent next to the auth header", async () => {
    const fetchSpy = mockFetch();

    vi.stubGlobal("fetch", fetchSpy);

    await createGraphQLClient({
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      token: "token",
      userAgent: "saleor-app-example/1.2.3",
    })
      .query(FetchAppDetailsDocument, {})
      .toPromise();

    // urql lowercases header names before handing them to fetch
    expect(getSentHeaders(fetchSpy)).toMatchObject({
      "user-agent": "saleor-app-example/1.2.3",
      "authorization-bearer": "token",
    });
  });

  it("does not send User-Agent when not provided", async () => {
    const fetchSpy = mockFetch();

    vi.stubGlobal("fetch", fetchSpy);

    await createGraphQLClient({ saleorApiUrl: "https://example.saleor.cloud/graphql/" })
      .query(FetchAppDetailsDocument, {})
      .toPromise();

    expect(getSentHeaders(fetchSpy)).not.toHaveProperty("user-agent");
  });

  it("does not send User-Agent in the browser", async () => {
    const fetchSpy = mockFetch();

    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("window", {});

    await createGraphQLClient({
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      userAgent: "saleor-app-example/1.2.3",
    })
      .query(FetchAppDetailsDocument, {})
      .toPromise();

    expect(getSentHeaders(fetchSpy)).not.toHaveProperty("user-agent");
  });

  it("reads the token from a getter on every request", async () => {
    const fetchSpy = mockFetch();
    let token = "first";

    vi.stubGlobal("fetch", fetchSpy);

    const client = createGraphQLClient({
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      token: () => token,
    });

    await client.query(FetchAppDetailsDocument, {}, { requestPolicy: "network-only" }).toPromise();
    token = "second";
    await client.query(FetchAppDetailsDocument, {}, { requestPolicy: "network-only" }).toPromise();

    expect(fetchSpy.mock.calls.map(([, init]) => (init as RequestInit).headers)).toMatchObject([
      { "authorization-bearer": "first" },
      { "authorization-bearer": "second" },
    ]);
  });
});
