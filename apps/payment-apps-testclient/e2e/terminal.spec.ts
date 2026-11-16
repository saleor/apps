import { createServer, type Server } from "node:http";

import { expect, type Page, test } from "@playwright/test";
import { jwtVerify } from "jose";

import type { TerminalState } from "../src/modules/square/terminal/test-session";

type Attempt = {
  attemptId: string;
  checkoutId: string;
  locationId: string;
  deviceId: string;
  actor: { id: string };
  version: string;
};

const saleorApiUrl = "https://saleor.example/graphql/";
const checkoutId = "browser-poc-checkout";
const sessionKey = `payment-testclient:terminal:${encodeURIComponent(saleorApiUrl)}:${checkoutId}`;
const paymentPath = `/env/${encodeURIComponent(
  saleorApiUrl,
)}/checkout/${checkoutId}/payment-gateway/square/terminal`;
let server: Server;
let attempts: Map<string, TerminalState>;
let starts: Attempt[];
let observations: string[];
let complete: boolean;
let loseFirstResponse: boolean;
let authFailures: string[];
let failedStatusRequests: number;
let malformedInitiation: boolean;
let holdInitiation: boolean;
let releaseInitiation: (() => void) | undefined;
let requireOperator: boolean;

/*
 * Simulates the Terminal service only. The browser and Next.js signing proxy are real.
 * Provider payment creation and Saleor reporting are deliberately outside this PoC.
 */
test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    try {
      const { payload } = await jwtVerify(
        (request.headers.authorization ?? "").replace(/^Bearer /, ""),
        new TextEncoder().encode("terminal-browser-poc-secret-for-local-tests-only"),
        {
          issuer: "terminal-browser-poc",
          audience: "saleor.app.square.terminal",
          algorithms: ["HS256"],
        },
      );

      if (
        payload.saleor_api_url !== saleorApiUrl ||
        payload.saleor_app_id !== "browser-terminal-app"
      ) {
        throw new Error("Unexpected installation identity");
      }
      if (payload.sub !== "staff-001" || payload.role !== "terminal:payments") {
        throw new Error("Unexpected staff identity or role");
      }
    } catch (error) {
      authFailures.push(String(error));
      response.writeHead(401, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid service token" }));

      return;
    }
    response.setHeader("content-type", "application/json");
    if (request.method === "POST" && request.url === "/api/terminal-checkouts") {
      let body = "";

      for await (const chunk of request) body += chunk;
      const input = JSON.parse(body) as Attempt;

      starts.push(input);
      let attempt = attempts.get(input.attemptId);

      if (!attempt) {
        attempt = {
          terminalCheckoutId: `terminal-${attempts.size + 1}`,
          saleorTransactionId: `transaction-${attempts.size + 1}`,
          checkoutId: input.checkoutId,
          status: "PENDING",
          pollUseful: true,
        };
        attempts.set(input.attemptId, attempt);
      }
      if (loseFirstResponse) {
        loseFirstResponse = false;
        // The service accepted the attempt, but the client cannot read its response.
        response.end("unreadable upstream response");

        return;
      }
      response.statusCode = 202;
      if (malformedInitiation) {
        malformedInitiation = false;
        response.end(JSON.stringify({ checkoutId: input.checkoutId }));

        return;
      }
      if (holdInitiation) {
        releaseInitiation = () => response.end(JSON.stringify(attempt));

        return;
      }
      response.end(JSON.stringify(attempt));

      return;
    }
    const attempt = [...attempts.values()].find(
      (value) =>
        request.url === `/api/terminal-checkouts/${value.terminalCheckoutId}` ||
        request.url === `/api/terminal-checkouts/${value.terminalCheckoutId}/cancel`,
    );

    if (!attempt) {
      response.statusCode = 404;
      response.end(JSON.stringify({ error: "Unknown terminal checkout" }));

      return;
    }
    observations.push(request.url!);
    if (request.method === "GET" && failedStatusRequests > 0) {
      failedStatusRequests -= 1;
      response.statusCode = 503;
      response.end(JSON.stringify({ error: "Temporary status failure" }));

      return;
    }
    if (request.method === "GET" && requireOperator) {
      attempt.status = "RECONCILIATION_NEEDED";
      attempt.pollUseful = false;
      attempt.operatorActionRequired = true;
      response.end(JSON.stringify(attempt));

      return;
    }
    if (request.method === "POST" && request.url?.endsWith("/cancel")) {
      attempt.status = "CANCELED";
      attempt.pollUseful = false;
    } else if (complete) {
      attempt.status = "COMPLETED";
      attempt.pollUseful = false;
    }
    response.end(JSON.stringify(attempt));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(4319, resolve);
  });
});

test.afterAll(async () => {
  if (server)
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
});

test.beforeEach(async ({ page }) => {
  attempts = new Map();
  starts = [];
  observations = [];
  authFailures = [];
  complete = false;
  loseFirstResponse = false;
  failedStatusRequests = 0;
  malformedInitiation = false;
  holdInitiation = false;
  releaseInitiation = undefined;
  requireOperator = false;
  // Seed a prepared checkout once; reload must use the session saved by the UI.
  await page.goto("/");
  await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
    key: sessionKey,
    session: { saleorApiUrl, checkoutId, channel: "default-channel" },
  });
  await page.goto(paymentPath);
  await page.getByLabel("Square location ID").fill("sandbox-location");
  await page.getByLabel("Square device ID").fill("sandbox-device");
});

test.afterEach(() => {
  releaseInitiation?.();
  expect(authFailures).toEqual([]);
});

async function startPayment(page: Page) {
  await page.getByRole("button", { name: "Take payment on Terminal" }).click();
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
}

async function expectSummary(page: Page) {
  await expect(page).toHaveURL(/\/summary$/);
  await expect(page.getByRole("heading", { name: "Payment complete" })).toBeVisible();
  await expect(page.getByText("terminal-1", { exact: true })).toBeVisible();
  await expect(page.getByText("transaction-1", { exact: true })).toBeVisible();
  expect(starts).toHaveLength(1);
  expect(starts[0]).toMatchObject({
    version: "saleor.app.square.terminal.v1",
    checkoutId,
    locationId: "sandbox-location",
    deviceId: "sandbox-device",
    actor: { id: "staff-001" },
  });
}

test("starts payment, polls, and displays confirmed transaction", async ({ page }) => {
  await startPayment(page);
  await expect(page.getByLabel("Square location ID")).toHaveValue("sandbox-location");
  await expect(page.getByLabel("Square device ID")).toHaveValue("sandbox-device");
  complete = true;
  await expectSummary(page);
  expect(observations).toContain("/api/terminal-checkouts/terminal-1");
});

test("refresh resumes the same pending attempt without starting again", async ({ page }) => {
  await startPayment(page);
  const attemptId = starts[0]!.attemptId;

  await page.reload();
  await expect(page.getByRole("status")).toContainText("Recovered the last terminal attempt");
  await expect(page.getByLabel("Square location ID")).toHaveValue("sandbox-location");
  await expect(page.getByLabel("Square device ID")).toHaveValue("sandbox-device");
  complete = true;
  await expectSummary(page);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), sessionKey);

  expect(saved.attemptId).toBe(attemptId);
});

test("unreadable initiation response preserves the recovery key across refresh", async ({
  page,
}) => {
  loseFirstResponse = true;
  await page.getByRole("button", { name: "Take payment on Terminal" }).click();
  await expect(page.getByRole("status")).toContainText("non-JSON response");
  await page.reload();
  await expect(page.getByLabel("Square location ID")).toHaveValue("sandbox-location");
  await expect(page.getByLabel("Square device ID")).toHaveValue("sandbox-device");
  await page.getByRole("button", { name: "Recover terminal attempt" }).click();
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
  expect(starts).toHaveLength(2);
  expect(starts[1]).toEqual(starts[0]);
  expect(attempts.size).toBe(1);
});

test("confirmed cancellation allows a new attempt with a new key", async ({ page }) => {
  await startPayment(page);
  await page.getByRole("button", { name: "Cancel payment", exact: true }).click();
  await expect(page.getByText("CANCELED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close attempt" }).click();
  await expect(page.getByLabel("Square device ID")).toBeEnabled();
  await startPayment(page);
  expect(starts).toHaveLength(2);
  expect(starts[1]!.attemptId).not.toBe(starts[0]!.attemptId);
  expect(attempts.size).toBe(2);
});

test("temporary status failure retries the original payment and reaches success", async ({
  page,
}) => {
  failedStatusRequests = 1;
  await startPayment(page);
  await expect(page.getByRole("status")).toContainText("Temporary status failure");
  await expect(page.getByRole("button", { name: "Take payment on Terminal" })).toHaveCount(0);
  complete = true;
  await expectSummary(page);
  expect(observations.length).toBeGreaterThanOrEqual(2);
  expect(new Set(observations)).toEqual(new Set(["/api/terminal-checkouts/terminal-1"]));
});

test("malformed successful response cannot confirm payment and remains recoverable", async ({
  page,
}) => {
  malformedInitiation = true;
  await page.getByRole("button", { name: "Take payment on Terminal" }).click();
  await expect(page.getByRole("status")).toContainText(
    "invalid response. No payment was confirmed",
  );
  await expect(page).toHaveURL(/\/square\/terminal$/);
  await expect(page.getByRole("heading", { name: "Payment complete" })).toHaveCount(0);
  await page.getByRole("button", { name: "Recover terminal attempt" }).click();
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
  expect(starts).toHaveLength(2);
  expect(starts[1]).toEqual(starts[0]);
  expect(attempts.size).toBe(1);
});

test("repeated clicks while initiation is pending send only one request", async ({ page }) => {
  holdInitiation = true;
  const button = page.getByRole("button", { name: "Take payment on Terminal" });
  const bounds = await button.boundingBox();

  expect(bounds).not.toBeNull();
  await button.click();
  await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await expect.poll(() => starts.length).toBe(1);
  // Real pointer clicks on the disabled control must not start another request.
  await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2, {
    clickCount: 2,
  });
  releaseInitiation!();
  releaseInitiation = undefined;
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
  complete = true;
  await expectSummary(page);
  expect(attempts.size).toBe(1);
});

test("operator reconciliation shows a warning and stops automatic polling", async ({ page }) => {
  requireOperator = true;
  await startPayment(page);
  await expect(page.getByText("RECONCILIATION NEEDED", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Stop. An operator must reconcile this attempt before retrying."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Take payment on Terminal" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/square\/terminal$/);
  const calls = observations.length;

  // Wait beyond one polling interval to prove pollUseful=false is respected.
  await page.waitForTimeout(3_000);
  expect(observations).toHaveLength(calls);
  expect(starts).toHaveLength(1);
});
