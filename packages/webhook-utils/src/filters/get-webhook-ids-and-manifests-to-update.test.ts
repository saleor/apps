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
          {
            id: "1",
            name: "webhook1",
            isActive: true,
            targetUrl: "",
            query: "",
            asyncEventsTypes: [],
            syncEventsTypes: [],
          },
          {
            id: "2",
            name: "webhook2",
            isActive: true,
            targetUrl: "",
            query: "",
            asyncEventsTypes: [],
            syncEventsTypes: [],
          },
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
      {
        webhookId: "1",
        webhookManifest: {
          asyncEvents: [],
          isActive: true,
          name: "webhook1",
          query: "newQuery1",
          syncEvents: [],
          targetUrl: "",
        },
      },
      {
        webhookId: "2",
        webhookManifest: {
          asyncEvents: [],
          isActive: true,
          name: "webhook2",
          query: "newQuery2",
          syncEvents: [],
          targetUrl: "",
        },
      },
    ]);
  });
  it("Returns subset of entries, when existing webhook list contain some of them", () => {
    expect(
      getWebhookIdsAndManifestsToUpdate({
        existingWebhooksPartial: [
          {
            id: "1",
            name: "webhook1",
            isActive: true,
            targetUrl: "",
            query: "",
            asyncEventsTypes: [],
            syncEventsTypes: [],
          },
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
      {
        webhookId: "1",
        webhookManifest: {
          asyncEvents: [],
          isActive: true,
          name: "webhook1",
          query: "newQuery1",
          syncEvents: [],
          targetUrl: "",
        },
      },
    ]);
  });
});
