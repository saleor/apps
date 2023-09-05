import { describe, expect, it } from "vitest";
import { getWebhookIdsAndManifestsToUpdate } from "./get-webhook-ids-and-manifests-to-update";

describe("getWebhookIdsAndQueriesToUpdate", () => {
  it("Returns an empty list, when no data is passed", () => {
    expect(
      getWebhookIdsAndManifestsToUpdate({
        existingWebhooksPartial: [],
        newWebhookManifests: [],
      }),
    ).toStrictEqual([]);
  });
  it("Returns all of the entries, when new webhook manifests contain the same webhooks as existing list", () => {
    expect(
      getWebhookIdsAndManifestsToUpdate({
        existingWebhooksPartial: [
          { id: "1", name: "webhook1" },
          { id: "2", name: "webhook2" },
        ],
        newWebhookManifests: [
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook1",
            query: "newQuery1",
            syncEvents: [],
            targetUrl: "",
          },
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook2",
            query: "newQuery2",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([
      { webhookId: "1", newQuery: "newQuery1" },
      { webhookId: "2", newQuery: "newQuery2" },
    ]);
  });
  it("Returns subset of entries, when existing webhook list contain some of them", () => {
    expect(
      getWebhookIdsAndManifestsToUpdate({
        existingWebhooksPartial: [{ id: "1", name: "webhook1" }],
        newWebhookManifests: [
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook1",
            query: "newQuery1",
            syncEvents: [],
            targetUrl: "",
          },
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook2",
            query: "newQuery2",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([
      {
        webhookId: "1",
        newQuery: "newQuery1",
      },
    ]);
  });
});
