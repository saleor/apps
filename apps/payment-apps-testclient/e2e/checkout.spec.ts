import { createServer, type Server } from "node:http";

import { expect, test } from "@playwright/test";

let server: Server;
let lines: unknown;
let productCount = 2;
const saleorUrl = "http://localhost:4319/graphql/";
const checkoutPath = `/env/${encodeURIComponent(saleorUrl)}/checkout/test-checkout`;

// The Next.js pages and server actions are real; Saleor is simulated here.
test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "content-type");
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();

      return;
    }
    let body = "";

    for await (const chunk of request) body += chunk;
    const input = JSON.parse(body) as {
      query: string;
      variables: { input?: { lines: unknown }; search?: string };
    };
    const query = input.query;
    let data: unknown;

    if (query.includes("query FetchProduct")) {
      data = {
        products: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: Array.from({ length: productCount }, (_, index) => ({
            node: {
              id: `product-${index}`,
              name: `Test product ${index + 1}`,
              thumbnail: null,
              category: null,
              variants: [
                {
                  id: `variant-${index}`,
                  name: "Default",
                  quantityAvailable: index === 0 ? 2 : 1,
                  pricing: { price: { gross: { amount: 10 + index, currency: "USD" } } },
                },
              ],
            },
          })),
        },
      };
    } else if (query.includes("mutation createCheckout")) {
      lines = input.variables.input?.lines;
      data = { checkoutCreate: { checkout: { id: "test-checkout" }, errors: [] } };
    } else if (query.includes("query getCheckoutSummary")) {
      const price = { gross: { amount: 31 }, currency: "USD" };

      data = {
        checkout: {
          id: "test-checkout",
          created: "2026-10-30T10:00:00Z",
          chargeStatus: "FULL",
          authorizeStatus: "FULL",
          billingAddress: null,
          shippingAddress: null,
          email: "test@example.com",
          totalPrice: price,
          subtotalPrice: price,
          shippingPrice: { gross: { amount: 0 }, currency: "USD" },
          lines: [
            {
              id: "line-1",
              quantity: 2,
              variant: { product: { name: "Test product" } },
              totalPrice: price,
            },
          ],
        },
      };
    } else if (query.includes("mutation CompleteCheckout")) {
      data = { checkoutComplete: { order: { id: "test-order", number: "367" }, errors: [] } };
    } else if (query.includes("query getCheckout")) {
      data = {
        checkout: {
          billingAddress: null,
          shippingAddress: null,
          shippingMethods: [],
          deliveryMethod: null,
        },
      };
    } else if (query.includes("query GetPaymentGateways")) {
      data = {
        checkout: {
          totalPrice: { gross: { amount: 31 } },
          availablePaymentGateways: [
            { id: "app.saleor.adyen", name: "Adyen" },
            { id: "saleor.app.payment.stripe", name: "Stripe" },
            { id: "saleor.app.square.dev", name: "Square Online" },
          ],
        },
      };
    } else if (query.includes("mutation InitializePaymentGateway")) {
      data = {
        paymentGatewayInitialize: {
          gatewayConfigs: [],
          errors: [
            { field: null, code: "INVALID", message: "Square test configuration unavailable" },
          ],
        },
      };
    } else if (query.includes("query GetCheckoutTotalPrice")) {
      data = {
        checkout: {
          totalPrice: { gross: { amount: 31, currency: "USD" } },
          channel: { slug: "default-channel" },
          email: "test@example.com",
          billingAddress: null,
          authorizeStatus: "NONE",
          chargeStatus: "NONE",
        },
      };
    } else {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          errors: [{ message: `Unexpected test operation: ${query.slice(0, 80)}` }],
        }),
      );

      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ data }));
  });
  await new Promise<void>((resolve) => server.listen(4319, resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test.beforeEach(() => {
  lines = undefined;
  productCount = 2;
});

test("prefills two products, edits quantities, and creates the shared checkout", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Environment URL", { exact: false }).fill(saleorUrl);
  await page.getByLabel("Channel slug").fill("default-channel");
  await page.getByRole("button", { name: "Fetch products" }).click();
  await expect(page.getByLabel("Quantity for Test product 1 Default")).toHaveValue("2");
  await expect(page.getByLabel("Quantity for Test product 2 Default")).toHaveValue("1");
  await page.screenshot({
    path: "test-results/unified-cart.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByLabel("Quantity for Test product 1 Default").fill("1");
  await page.getByRole("button", { name: "Create checkout (2 variants)" }).click();
  await expect(page).toHaveURL(
    new RegExp(`${checkoutPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`),
  );
  await expect(page.getByText("Could not create checkout", { exact: true })).toHaveCount(0);
  expect(lines).toEqual([
    { variantId: "variant-1", quantity: 1 },
    { variantId: "variant-0", quantity: 1 },
  ]);
  await expect(page.getByRole("heading", { name: "Billing Information" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shipping Information" })).toBeVisible();
  await page.getByRole("link", { name: "Continue to payment gateway" }).click();
  await page.getByRole("combobox").click();
  await expect(page.getByRole("option", { name: /Adyen/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Stripe/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Square Online/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Square Terminal/ })).toBeVisible();
  await page.screenshot({
    path: "test-results/unified-gateway-selection.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("option", { name: /Square Terminal/ }).click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Square Terminal Payment" })).toBeVisible();
  await page.screenshot({
    path: "test-results/unified-terminal.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("a one-product channel can create a checkout", async ({ page }) => {
  productCount = 1;
  await page.goto("/");
  await page.getByLabel("Environment URL", { exact: false }).fill(saleorUrl);
  await page.getByRole("button", { name: "Fetch products" }).click();
  await expect(page.getByRole("button", { name: "Create checkout (1 variants)" })).toBeEnabled();
  await page.getByRole("button", { name: "Create checkout (1 variants)" }).click();
  await expect(page.getByRole("heading", { name: "Billing Information" })).toBeVisible();
  await expect(page.getByText("Could not create checkout", { exact: true })).toHaveCount(0);
  expect(lines).toEqual([{ variantId: "variant-0", quantity: 2 }]);
});

test("Square initialization failure stays inside the selected provider flow", async ({ page }) => {
  await page.goto(`${checkoutPath}/payment-gateway`);
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: /Square Online/ }).click();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page).toHaveURL(/payment-gateway\/square\/saleor.app.square.dev$/);
  await expect(page.getByText("Square test configuration unavailable")).toBeVisible();
  await page.getByRole("link", { name: "Back to gateways" }).click();
  await expect(page).toHaveURL(/payment-gateway$/);
});

test("opens an existing checkout without requiring products", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Environment URL", { exact: false }).fill(saleorUrl);
  const checkout = page.getByRole("region", { name: "Checkout", exact: true });

  await expect(checkout).toBeVisible();
  await checkout.getByLabel("Existing checkout ID").fill("test-checkout");
  await checkout.getByRole("button", { name: "Open checkout" }).click();
  await expect(page.getByRole("heading", { name: "Billing Information" })).toBeVisible();
  expect(lines).toBeUndefined();
});

test("completion retains the order confirmation and replaces the completion action", async ({
  page,
}) => {
  await page.goto(`${checkoutPath}/payment-gateway/square/saleor.app.square/summary`);
  await page.getByRole("button", { name: "Complete checkout", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Order #367 created");
  await expect(page.getByRole("button", { name: "Complete checkout", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View order in Dashboard" })).toHaveAttribute(
    "href",
    "http://localhost:4319/dashboard/orders/test-order",
  );
  await expect(page.getByRole("link", { name: "Start another checkout" })).toHaveAttribute(
    "href",
    "/",
  );
  await page.screenshot({
    path: "test-results/completed-order.png",
    fullPage: true,
    animations: "disabled",
  });
});
