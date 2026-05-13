import { describe, expect, it } from "vitest";

import { messageEventTypesLabels } from "../../event-handlers/message-event-types";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";

describe("smtpDefaultEmptyConfigurations", () => {
  describe("eventsConfiguration", () => {
    it("Excludes deprecated event types from new tenants' default configuration", () => {
      const events = smtpDefaultEmptyConfigurations.eventsConfiguration();
      const deprecatedEventTypes = events.filter(
        (event) => messageEventTypesLabels[event.eventType].deprecated,
      );

      expect(deprecatedEventTypes).toHaveLength(0);
    });

    it("Includes ACCOUNT_CONFIRMATION_REQUESTED in new tenants' default configuration", () => {
      const events = smtpDefaultEmptyConfigurations.eventsConfiguration();

      expect(events.find((e) => e.eventType === "ACCOUNT_CONFIRMATION_REQUESTED")).toBeDefined();
    });

    it("Does not include legacy ACCOUNT_CONFIRMATION in new tenants' default configuration", () => {
      const events = smtpDefaultEmptyConfigurations.eventsConfiguration();

      expect(events.find((e) => e.eventType === "ACCOUNT_CONFIRMATION")).toBeUndefined();
    });

    it("All events default to active=false", () => {
      const events = smtpDefaultEmptyConfigurations.eventsConfiguration();

      expect(events.every((e) => e.active === false)).toBe(true);
    });
  });
});
