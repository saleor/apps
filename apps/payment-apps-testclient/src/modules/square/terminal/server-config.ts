import { createSecretKey } from "node:crypto";

import { SignJWT } from "jose";

import { readTerminalEnvironment } from "@/env";

export function terminalAppUrl() {
  const value = readTerminalEnvironment().appUrl;

  if (!value) throw new Error("TERMINAL_APP_URL is not configured.");

  const url = new URL(value);

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("TERMINAL_APP_URL must use HTTPS unless it targets localhost.");
  }

  return url;
}

export async function signStaffToken(actorId: string, saleorApiUrl: URL) {
  const appId = readTerminalEnvironment().appId?.trim();

  if (!appId) throw new Error("SALEOR_APP_ID is not configured.");

  const issuer = readTerminalEnvironment().issuer;
  const secret = readTerminalEnvironment().secret;

  if (!issuer || !secret || secret.length < 32) {
    throw new Error("The integration service-token environment is incomplete.");
  }

  return new SignJWT({
    role: "terminal:payments",
    saleor_api_url: saleorApiUrl.href,
    saleor_app_id: appId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience("saleor.app.square.terminal")
    .setSubject(actorId)
    .setIssuedAt()
    .setExpirationTime("4m")
    .sign(createSecretKey(Buffer.from(secret, "utf8")));
}

export function validateSaleorUrl(value: unknown) {
  if (typeof value !== "string") throw new Error("Saleor API URL is required.");
  const url = new URL(value);

  if (!url.pathname.endsWith("/graphql/")) throw new Error("Saleor API URL must end in /graphql/.");
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("Saleor API URL must use HTTPS unless it targets localhost.");
  }

  return url;
}

export const isTerminalConfigured = () => {
  const { appUrl, appId, issuer, secret } = readTerminalEnvironment();

  return Boolean(appUrl && appId?.trim() && issuer && secret && secret.length >= 32);
};
