import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isTerminalConfigured, signStaffToken } from "@/modules/square/terminal/server-config";

import { POST } from "./route";

vi.mock("@/modules/square/terminal/server-config", () => ({
  isTerminalConfigured: vi.fn(() => true),
  signStaffToken: vi.fn().mockResolvedValue("test-token"),
  terminalAppUrl: () => new URL("http://localhost:3002"),
  validateSaleorUrl: (value: string) => new URL(value),
}));

beforeEach(() => vi.mocked(isTerminalConfigured).mockReturnValue(true));
afterEach(() => vi.unstubAllGlobals());

function startRequest() {
  return new Request("http://localhost/api/terminal", {
    method: "POST",
    body: JSON.stringify({
      action: "start",
      actorId: "staff-001",
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      checkoutId: "checkout-1",
      attemptId: "attempt-0001",
      locationId: "location-1",
      deviceId: "device-1",
    }),
  });
}

describe("Terminal proxy responses", () => {
  it("rejects Terminal calls when the shared client has no Terminal configuration", async () => {
    vi.mocked(isTerminalConfigured).mockReturnValue(false);
    const fetchMock = vi.fn();

    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(startRequest());

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("signs the service token for the checkout's Saleor installation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ error: "x" }, { status: 400 })),
    );

    await POST(startRequest());

    expect(signStaffToken).toHaveBeenCalledWith(
      "staff-001",
      new URL("https://example.saleor.cloud/graphql/"),
    );
  });

  it("preserves a definitive preflight rejection code", async () => {
    const rejection = { error: "Target rejected.", code: "SQUARE_DEVICE_NOT_FOUND" };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(rejection, { status: 404 })));

    const response = await POST(startRequest());

    expect(response.status).toBe(404);
    expect(await response.json()).toStrictEqual(rejection);
  });

  it.each([200, 404])(
    "reports an HTML response with HTTP %i as a configuration error",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("<html>Wrong app</html>", { status })),
      );

      const response = await POST(startRequest());
      const body = await response.json();

      expect(response.status).toBe(502);
      expect(body.error).toContain("TERMINAL_APP_URL");
      expect(body.error).not.toContain("<html>");
    },
  );

  it("rejects a successful response without payment state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ terminalCheckoutId: "terminal-1" })),
    );

    const response = await POST(startRequest());

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("No payment was confirmed");
  });

  it("passes a valid payment response and preserves the recovery id", async () => {
    const state = { terminalCheckoutId: "terminal-1", checkoutId: "checkout-1", status: "PENDING" };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(state));

    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(startRequest());

    expect(await response.json()).toStrictEqual(state);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toMatchObject({
      attemptId: "attempt-0001",
      locationId: "location-1",
      deviceId: "device-1",
    });
  });
});
