import { timingSafeEqual } from "node:crypto";

import { type NextApiHandler } from "next";

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 *
 * Fails closed when `secret` is unset: apps keep `CRON_SECRET` optional so deployments predating
 * their cron keep booting, which would otherwise leave the route open to anyone.
 */
export const isAuthorizedCronRequest = (
  req: { headers: Record<string, string | string[] | undefined> },
  secret: string | undefined,
): boolean => {
  if (!secret) {
    return false;
  }

  const header = req.headers.authorization;

  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    return false;
  }

  const provided = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);

  // Constant-time compare; length must match first or timingSafeEqual throws.
  return provided.length === expected.length && timingSafeEqual(provided, expected);
};

/**
 * Guards a cron route: answers 401 unless the request carries the cron secret, otherwise hands the
 * untouched request to `handler`, which owns everything else (body parsing, status codes).
 */
export const withCronAuth =
  (
    {
      secret,
      logger,
    }: { secret: string | undefined; logger: { warn: (message: string) => unknown } },
    handler: NextApiHandler,
  ): NextApiHandler =>
  (req, res) => {
    if (!isAuthorizedCronRequest(req, secret)) {
      logger.warn("Rejected an unauthorized cron request");

      return res.status(401).json({ error: "Unauthorized" });
    }

    return handler(req, res);
  };

/** `withCronAuth` for App Router route handlers. */
export const withCronAuthAppRouter =
  <TRequest extends Request>(
    {
      secret,
      logger,
    }: { secret: string | undefined; logger: { warn: (message: string) => unknown } },
    handler: (req: TRequest) => Promise<Response>,
  ) =>
  (req: TRequest): Promise<Response> => {
    const authorization = req.headers.get("authorization") ?? undefined;

    if (!isAuthorizedCronRequest({ headers: { authorization } }, secret)) {
      logger.warn("Rejected an unauthorized cron request");

      return Promise.resolve(Response.json({ error: "Unauthorized" }, { status: 401 }));
    }

    return handler(req);
  };
