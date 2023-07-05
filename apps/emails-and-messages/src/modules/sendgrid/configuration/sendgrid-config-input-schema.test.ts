import { expect, describe, it } from "vitest";
import { sendgridUpdateEventArraySchema } from "./sendgrid-config-input-schema";
import { ZodError } from "zod";

describe("sendgridUpdateEventArraySchema", async function () {
  it("No errors should be thrown, when active event has specified template", async () => {
    sendgridUpdateEventArraySchema.parse({
      configurationId: "123",
      events: [
        {
          eventType: "ORDER_CREATED",
          active: true,
          template: "123",
        },
      ],
    });
  });
  it("No errors should be thrown, when non active event has no template", async () => {
    sendgridUpdateEventArraySchema.parse({
      configurationId: "123",
      events: [
        {
          eventType: "ORDER_CREATED",
          active: false,
          template: undefined,
        },
      ],
    });
  });

  it("Error should be thrown, when any of active events has no template", async () => {
    await expect(async () =>
      sendgridUpdateEventArraySchema.parse({
        configurationId: "123",
        events: [
          {
            eventType: "ORDER_CREATED",
            active: true,
            template: "123",
          },
          {
            eventType: "ORDER_FULFILLED",
            active: true,
            template: undefined,
          },
        ],
      })
    ).rejects.toThrow(
      new ZodError([
        {
          code: "custom",
          message: "All active events must have assigned template.",
          path: ["events"],
        },
      ])
    );
  });
});
