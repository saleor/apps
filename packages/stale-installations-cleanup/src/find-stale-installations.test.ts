import { afterEach, describe, expect, it, vi } from "vitest";

import { findStaleInstallations } from "./find-stale-installations";

vi.mock("@vercel/oidc", () => ({ getVercelOidcToken: vi.fn(async () => "oidc-token") }));

const GONE = "https://gone.eu.saleor.cloud/graphql/";
const ALIVE = "https://alive.eu.saleor.cloud/graphql/";
const GONE_LEGACY = "https://gone.saleor.cloud/graphql/";
const CUSTOM_DOMAIN = "https://mycustomsaleor.com/graphql/";
const STAGING = "https://shop.staging.saleor.cloud/graphql/";

const mockCloud = (existingDomains: string[], status = 200) => {
  const fetchMock = vi.fn(async (_url: URL, init: RequestInit) => {
    const { domains } = JSON.parse(init.body as string) as { domains: string[] };

    return new Response(
      JSON.stringify({
        data: domains.map((domain) => ({ domain, exists: existingDomains.includes(domain) })),
      }),
      { status },
    );
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
};

const find = (saleorApiUrls: string[]) =>
  findStaleInstallations({
    installations: saleorApiUrls.map((saleorApiUrl) => ({ saleorApiUrl })),
    cloudApiUrl: "https://cloud.example.io/platform/api",
    oidcAudience: "aud",
    rootDomains: ["saleor.cloud", "eu.saleor.cloud"],
  });

describe("findStaleInstallations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Returns installations whose environment Cloud reports gone", async () => {
    const fetchMock = mockCloud(["alive.eu.saleor.cloud"]);

    const result = await find([GONE, GONE_LEGACY, ALIVE, "not a url"]);

    expect(result._unsafeUnwrap()).toStrictEqual({
      stale: [GONE, GONE_LEGACY],
      checked: 3,
      skipped: 0,
      unknown: 1,
    });

    const [url, init] = fetchMock.mock.calls[0];

    expect(url.toString()).toBe(
      "https://cloud.example.io/platform/api/service/environments/bulk-check-exists/",
    );
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer oidc-token");
    expect(JSON.parse(init.body as string)).toStrictEqual({
      domains: ["gone.eu.saleor.cloud", "gone.saleor.cloud", "alive.eu.saleor.cloud"],
    });
  });

  it("Skips installations on another Saleor Cloud, e.g. staging under production root domains", async () => {
    const fetchMock = mockCloud([]);

    const result = await find([GONE, STAGING]);

    expect(result._unsafeUnwrap()).toStrictEqual({
      stale: [GONE],
      checked: 1,
      skipped: 1,
      unknown: 0,
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toStrictEqual({
      domains: ["gone.eu.saleor.cloud"],
    });
  });

  it("Skips installations on a custom domain", async () => {
    const fetchMock = mockCloud([]);

    const result = await find([GONE, CUSTOM_DOMAIN]);

    expect(result._unsafeUnwrap()).toStrictEqual({
      stale: [GONE],
      checked: 1,
      skipped: 1,
      unknown: 0,
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toStrictEqual({
      domains: ["gone.eu.saleor.cloud"],
    });
  });

  it("Checks in batches of 1000 domains", async () => {
    const fetchMock = mockCloud([]);

    const result = await find(
      Array.from({ length: 1001 }, (_, i) => `https://shop-${i}.eu.saleor.cloud/graphql/`),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result._unsafeUnwrap().stale).toHaveLength(1001);
  });

  it("Returns an error, not stale installations, when Cloud fails", async () => {
    mockCloud([], 500);

    const result = await find([GONE, ALIVE]);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(Error);
  });
});
