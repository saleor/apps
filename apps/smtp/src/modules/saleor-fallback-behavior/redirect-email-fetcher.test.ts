import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchRedirectEmail } from "./redirect-email-fetcher";

describe("fetchRedirectEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns owner_email on successful response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          organization: { owner_email: "owner@example.com" },
          service: { type: "SANDBOX" },
        }),
        { status: 200 },
      ),
    );

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result._unsafeUnwrap()).toBe("owner@example.com");
  });

  it("sends Authorization Bearer header", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ organization: { owner_email: "owner@example.com" } }), {
          status: 200,
        }),
      );

    await fetchRedirectEmail("https://example.com/api", "my-token");

    expect(fetchSpy).toHaveBeenCalledWith("https://example.com/api", {
      headers: { Authorization: "Bearer my-token" },
    });
  });

  it("returns error on network failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain("Network error");
  });

  it("returns error on non-OK HTTP status", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response(null, { status: 403 }));

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain("403");
  });

  it("returns error when response body is not valid JSON", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(new Response("not json", { status: 200 }));

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result.isErr()).toBe(true);
  });

  it("returns error when organization.owner_email is missing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ organization: {} }), { status: 200 }),
    );

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain("schema");
  });

  it("returns error when owner_email is not a valid email", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ organization: { owner_email: "not-an-email" } }), {
        status: 200,
      }),
    );

    const result = await fetchRedirectEmail("https://example.com/api", "token123");

    expect(result.isErr()).toBe(true);
  });
});
