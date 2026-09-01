import { gql } from "urql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createGraphQLClient } from "./create-graphql-client";

const TestQuery = gql`
  query TestQuery {
    shop {
      name
    }
  }
`;

const mockFetch = () =>
  vi.fn().mockResolvedValue(
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
      .query(TestQuery, {})
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
      .query(TestQuery, {})
      .toPromise();

    expect(getSentHeaders(fetchSpy)).not.toHaveProperty("user-agent");
  });
});
