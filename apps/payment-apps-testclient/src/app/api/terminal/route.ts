import { NextResponse } from "next/server";

import {
  isTerminalConfigured,
  signStaffToken,
  terminalAppUrl,
  validateSaleorUrl,
} from "@/modules/square/terminal/server-config";
import { parseTerminalState } from "@/modules/square/terminal/test-session";

export async function POST(request: Request) {
  if (!isTerminalConfigured())
    return NextResponse.json(
      { error: "Square Terminal is not configured on this test client." },
      { status: 503 },
    );
  try {
    const input = (await request.json()) as Record<string, unknown>;
    const actorId = typeof input.actorId === "string" ? input.actorId.trim() : "";
    const action = input.action;

    if (!actorId) throw new Error("Actor id is required.");
    if (action !== "start" && action !== "status" && action !== "cancel") {
      throw new Error("Unsupported terminal action.");
    }

    const token = await signStaffToken(actorId, validateSaleorUrl(input.saleorApiUrl));
    const appUrl = terminalAppUrl();
    let path = "/api/terminal-checkouts";
    let method = "POST";
    let body: string | undefined;

    if (action === "start") {
      body = JSON.stringify({
        version: "saleor.app.square.terminal.v1",
        checkoutId: input.checkoutId,
        locationId: input.locationId,
        deviceId: input.deviceId,
        attemptId: input.attemptId,
        actor: { id: actorId },
        ...(input.associateId
          ? {
              associate: {
                id: input.associateId,
                ...(input.squareTeamMemberId
                  ? { squareTeamMemberId: input.squareTeamMemberId }
                  : {}),
              },
            }
          : {}),
        ...(input.reference ? { reference: input.reference } : {}),
      });
    } else {
      if (typeof input.terminalCheckoutId !== "string" || !input.terminalCheckoutId) {
        throw new Error("Terminal checkout id is required.");
      }
      path = `/api/terminal-checkouts/${encodeURIComponent(input.terminalCheckoutId)}`;
      if (action === "cancel") path += "/cancel";
      else method = "GET";
    }

    const response = await fetch(new URL(path, appUrl), {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    const text = await response.text();
    let result: unknown;

    try {
      result = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json(
        {
          error: `Terminal app returned a non-JSON response (HTTP ${response.status}). Check that TERMINAL_APP_URL points to the Square Terminal app.`,
        },
        { status: 502 },
      );
    }
    if (response.ok) result = parseTerminalState(result);

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 },
    );
  }
}
