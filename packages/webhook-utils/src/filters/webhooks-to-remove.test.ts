import { describe, expect, it } from "vitest";
import { webhooksToRemove } from "./webhooks-to-remove";

describe("webhooksToRemove", () => {
  it("Returns an empty list, when no data is passed", () => {
    expect(
      webhooksToRemove({
        existingWebhooksPartial: [],
        newWebhookManifests: [],
      }),
    ).toStrictEqual([]);
  });
  it("Returns empty list, when new webhook manifests contain the same webhooks as existing list", () => {
    expect(
      webhooksToRemove({
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
  it("Returns all of the existing webhooks, when new webhook manifests list is empty", () => {
    expect(
      webhooksToRemove({
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
        newWebhookManifests: [],
      }),
    ).toStrictEqual([
      {
        id: "1",
        name: "webhook1",
        query: "",
        targetUrl: "",
        isActive: true,
        syncEventsTypes: [],
        asyncEventsTypes: [],
      },
      {
        id: "2",
        name: "webhook2",
        query: "",
        targetUrl: "",
        isActive: true,
        syncEventsTypes: [],
        asyncEventsTypes: [],
      },
    ]);
  });
  it("Returns list with the webhook one webhook to remove, when it was not specified in the new manifests", () => {
    expect(
      webhooksToRemove({
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
            query: "",
            syncEvents: [],
            targetUrl: "",
          },
        ],
      }),
    ).toStrictEqual([
      {
        id: "2",
        name: "webhook2",
        asyncEventsTypes: [],
        syncEventsTypes: [],
        query: "",
        targetUrl: "",
        isActive: true,
      },
    ]);
  });
});
