import "dotenv/config";
import "./data/functions";

import { request, settings, stash } from "pactum";
import { beforeAll } from "vitest";

import { env } from "../src/env";

beforeAll(() => {
  const saleorApiUrl = env.TEST_SALEOR_API_URL;

  const staffCredentials = {
    email: env.E2E_USER_NAME,
    password: env.E2E_USER_PASSWORD,
  };

  if (!saleorApiUrl) {
    throw new Error("Cannot run tests TEST_SALEOR_API_URL is not set");
  }

  if (!staffCredentials.email || !staffCredentials.password) {
    throw new Error("Cannot run tests E2E_USER_NAME or E2E_USER_PASSWORD is not set");
  }

  const { origin: saleorBaseUrl } = new URL(saleorApiUrl);

  if (!saleorBaseUrl) {
    throw new Error("Cannot run tests TEST_SALEOR_API_URL is invalid");
  }

  settings.setRequestDefaultRetryCount(3); // retry up to 3 times by default
  settings.setRequestDefaultRetryDelay(50); // wait 50ms between retries
  settings.setLogLevel("DEBUG");

  /*
   * We have to use baseUrl (without /graphql/ suffix)
   * for Pactum to work properly, it expects a base URL + path for each request
   */
  request.setBaseUrl(saleorBaseUrl);
  /*
   * Use a default 20s timeout for tests
   * This is a timeout for sync webhooks in Saleor
   */
  request.setDefaultTimeout(21_000);
  stash.loadData("./e2e/data");
});
