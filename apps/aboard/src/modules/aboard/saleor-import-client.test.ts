import { afterEach, describe, expect, it, vi } from "vitest";

import { ExistingImportChannelDocument } from "@/generated/graphql";

import { createSaleorImportClient, SaleorImportClientError } from "./saleor-import-client";

const saleorApiUrl = "https://saleor.example/graphql/";
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });

describe("createSaleorImportClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends operations as POST with the current Dashboard token", async () => {
    const fetch = vi.fn(async (_url: string, _init: RequestInit) =>
      json({ data: { channels: [] } }),
    );

    vi.stubGlobal("fetch", fetch);
    let token = "first-token";
    const client = createSaleorImportClient({ saleorApiUrl, getToken: () => token });

    await client.query(ExistingImportChannelDocument, {});
    token = "renewed-token";
    const result = await client.query(ExistingImportChannelDocument, {});

    expect(result._unsafeUnwrap()).toStrictEqual({ channels: [] });
    expect(fetch).toHaveBeenCalledTimes(2);

    const [url, init] = fetch.mock.calls[1];

    expect(url).toBe(saleorApiUrl);
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("authorization-bearer")).toBe("renewed-token");
  });

  it("stops before sending a request when the Dashboard session changed", async () => {
    const fetch = vi.fn();

    vi.stubGlobal("fetch", fetch);
    const client = createSaleorImportClient({ saleorApiUrl, getToken: () => undefined });

    const error = (await client.query(ExistingImportChannelDocument, {}))._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(SaleorImportClientError.SessionChangedError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns GraphQL errors as a request error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ data: null, errors: [{ message: "Permission denied" }] })),
    );
    const client = createSaleorImportClient({ saleorApiUrl, getToken: () => "token" });

    const error = (await client.query(ExistingImportChannelDocument, {}))._unsafeUnwrapErr();

    expect(error).toBeInstanceOf(SaleorImportClientError.RequestError);
    expect(error.message).toBe("Permission denied");
  });
});
