import { beforeAll } from "vitest";
import { request, stash } from "pactum";
import "./data/functions";

beforeAll(() => {
  // TODO: Change me use API URL storage method
  request.setBaseUrl("https://shopex-avatax-318.eu.saleor.cloud");
  /*
   * Use a default 20s timeout for tests
   * This is a timeout for sync webhooks in Saleor
   */
  request.setDefaultTimeout(20_000);
  stash.loadData("./e2e/data");
});
