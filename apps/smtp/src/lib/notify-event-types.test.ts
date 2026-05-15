import { describe, expect, it } from "vitest";

import { notifyEventMapping } from "./notify-event-types";

describe("notifyEventMapping", () => {
  it("maps account_set_customer_password (emitted by customerCreate with redirectUrl) to ACCOUNT_SET_CUSTOMER_PASSWORD message event", () => {
    expect(notifyEventMapping["account_set_customer_password"]).toBe(
      "ACCOUNT_SET_CUSTOMER_PASSWORD",
    );
  });

  it("maps account_password_reset (emitted by requestPasswordReset) to ACCOUNT_PASSWORD_RESET", () => {
    expect(notifyEventMapping["account_password_reset"]).toBe("ACCOUNT_PASSWORD_RESET");
  });
});
