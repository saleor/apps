import { describe, expect, it } from "vitest";
import { webhooksToAdd } from "./webhooks-to-add";

describe("webhooksToAdd", () => {
  it("Returns an empty list, when no data is passed", () => {
    expect(
      webhooksToAdd({
        existingWebhooksPartial: [],
        newWebhookManifests: [],
      }),
    ).toStrictEqual([]);
  });
  it("Returns empty list, when new webhook manifests contain the same webhooks as existing list", () => {
    expect(
      webhooksToAdd({
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
            id: "1",
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
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook2",
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([]);
  });
  it("Returns all of the manifests, when existing webhook list is empty", () => {
    expect(
      webhooksToAdd({
        existingWebhooksPartial: [],
        newWebhookManifests: [
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook1",
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
          {
            asyncEvents: [],
            isActive: true,
            name: "webhook2",
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([
      {
        asyncEvents: [],
        isActive: true,
        name: "webhook1",
        query: "",
        syncEvents: [],
        targetUrl: "",
      },
      {
        asyncEvents: [],
        isActive: true,
        name: "webhook2",
        query: "",
        syncEvents: [],
        targetUrl: "",
      },
    ]);
  });
  it("Returns list with the new webhook to add, when it was not specified in the existing manifests", () => {
    expect(
      webhooksToAdd({
        existingWebhooksPartial: [
          {
            id: "1",
            name: "webhookOld",
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
            name: "webhookOld",
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
          {
            asyncEvents: [],
            isActive: true,
            name: "webhookNew",
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([
      {
        asyncEvents: [],
        isActive: true,
        name: "webhookNew",
        query: "",
        syncEvents: [],
        targetUrl: "",
      },
    ]);
  });
});
