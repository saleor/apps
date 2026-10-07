import { type NextApiRequest, type NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";

import { isAuthorizedCronRequest, withCronAuth } from "./cron";

describe("isAuthorizedCronRequest", () => {
  it("Accepts the bearer token Vercel Cron sends", () => {
    expect(
      isAuthorizedCronRequest(
        { headers: { authorization: "Bearer correct-secret" } },
        "correct-secret",
      ),
    ).toBe(true);
  });

  it.each([
    ["a wrong secret", { authorization: "Bearer wrong-secret" }],
    ["a secret of a different length", { authorization: "Bearer correct" }],
    ["a missing scheme", { authorization: "correct-secret" }],
    ["no header at all", {}],
  ])("Rejects %s", (_label, headers) => {
    expect(isAuthorizedCronRequest({ headers }, "correct-secret")).toBe(false);
  });

  /* Apps keep the secret optional so old deployments keep booting — that must not open the route. */
  it("Rejects everything while the secret is unset", () => {
    expect(isAuthorizedCronRequest({ headers: { authorization: "Bearer " } }, undefined)).toBe(
      false,
    );
    expect(
      isAuthorizedCronRequest({ headers: { authorization: "Bearer undefined" } }, undefined),
    ).toBe(false);
  });
});

describe("withCronAuth", () => {
  const createRes = () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));

    return { res: { status } as unknown as NextApiResponse, status, json };
  };

  const createReq = (authorization?: string) =>
    ({ headers: authorization ? { authorization } : {} }) as NextApiRequest;

  it("Answers 401 without calling the handler when the secret does not match", async () => {
    const handler = vi.fn();
    const logger = { warn: vi.fn() };
    const { res, status, json } = createRes();

    await withCronAuth({ secret: "secret", logger }, handler)(createReq("Bearer nope"), res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(handler).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("Passes the untouched request and response to the handler when authorized", async () => {
    const handler = vi.fn();
    const req = createReq("Bearer secret");
    const { res, status } = createRes();

    await withCronAuth({ secret: "secret", logger: { warn: vi.fn() } }, handler)(req, res);

    expect(handler).toHaveBeenCalledWith(req, res);
    expect(status).not.toHaveBeenCalled();
  });
});
