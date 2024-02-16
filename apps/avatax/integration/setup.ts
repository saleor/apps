import { beforeAll } from "vitest";
import { request, stash } from "pactum";
import "./data/functions";

beforeAll(() => {
  request.setBaseUrl("https://shopex-avatax-318.eu.saleor.cloud");
  request.setDefaultTimeout(20_000); // Sync webhooks timeout after 20s
  stash.loadData("./integration/data");
});
