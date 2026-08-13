import { cleanup, configure, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getActiveCommerceTaskId,
  getCommerceTasks,
  getReadinessProgress,
  type StoreReadiness,
} from "./readiness/get-store-readiness";
import { StoreReadinessChecklistBody } from "./store-readiness-checklist";
import { StoreReadinessSkeleton } from "./store-readiness-skeleton";

configure({ testIdAttribute: "data-test-id" });

vi.mock("@saleor/app-sdk/app-bridge", () => ({
  useAppBridge: () => ({
    appBridgeState: {
      token: "token",
      user: { permissions: ["MANAGE_CHANNELS", "MANAGE_PRODUCTS", "MANAGE_APPS"] },
    },
  }),
}));

vi.mock("./hooks/use-app-redirect", () => ({
  useAppRedirect: () => vi.fn(),
}));

vi.mock("./components/buttons/invite-staff-button", () => ({
  InviteStaffButton: () => <button type="button">Invite</button>,
}));

afterEach(() => {
  cleanup();
});

const greenfield: StoreReadiness = {
  channelId: null,
  channelName: null,
  hasChannels: false,
  hasWarehouse: false,
  hasShipping: false,
  channelReady: false,
  hasProduct: false,
  hasPaymentApp: false,
  hasOrder: false,
  smtpAppId: null,
  channelsKnown: true,
  shippingKnown: true,
  productsKnown: true,
  paymentsKnown: true,
  ordersKnown: true,
};

const midSetup: StoreReadiness = {
  ...greenfield,
  channelId: "Q2hhbm5lbDox",
  channelName: "Default Channel",
  hasChannels: true,
  hasWarehouse: true,
  hasShipping: true,
  channelReady: true,
};

const ready: StoreReadiness = {
  ...midSetup,
  hasProduct: true,
  hasPaymentApp: true,
};

const renderBody = (
  readiness: StoreReadiness,
  builderExpanded = false,
  expandedId?: string | null,
) => {
  const tasks = getCommerceTasks(readiness);
  const progress = getReadinessProgress(tasks);
  const activeTaskId = getActiveCommerceTaskId(tasks);

  return render(
    <StoreReadinessChecklistBody
      readiness={readiness}
      tasks={tasks}
      progress={progress}
      activeTaskId={activeTaskId}
      expandedId={expandedId === undefined ? activeTaskId : expandedId}
      builderExpanded={builderExpanded}
      onToggleTask={vi.fn()}
      onToggleBuilder={vi.fn()}
    />,
  );
};

describe("StoreReadinessChecklistBody", () => {
  it("renders greenfield store setup with one primary CTA", () => {
    renderBody(greenfield);

    expect(screen.getByRole("heading", { name: "Get ready to sell" })).toBeTruthy();
    expect(screen.getByTestId("store-readiness-progress").textContent).toContain("0 of 3");
    expect(screen.getByTestId("store-readiness-next-up").textContent).toMatch(
      /Set up your sales channel/,
    );
    expect(screen.getAllByTestId("store-readiness-cta")).toHaveLength(1);
    expect(
      screen.getByTestId("store-readiness-task-sales-channel").getAttribute("data-status"),
    ).toBe("active");
    expect(
      screen.getByTestId("store-readiness-task-first-product").getAttribute("data-status"),
    ).toBe("locked");
  });

  it("moves next-up to product after the sales channel is ready", () => {
    renderBody(midSetup);

    expect(screen.getByTestId("store-readiness-progress").textContent).toContain("1 of 3");
    expect(screen.getByTestId("store-readiness-next-up").textContent).toMatch(
      /Add your first product/,
    );
    expect(
      screen.getByTestId("store-readiness-task-sales-channel").getAttribute("data-status"),
    ).toBe("completed");
    expect(screen.getAllByTestId("store-readiness-cta")).toHaveLength(1);
  });

  it("shows ready state and keeps builder tools secondary", () => {
    renderBody(ready, true);

    expect(screen.getByText("You’re ready to sell")).toBeTruthy();
    expect(screen.getByTestId("store-readiness-progress").textContent).toContain("3 of 3");
    expect(screen.getByTestId("store-readiness-next-up").textContent).toMatch(
      /Required steps are complete/,
    );

    const builder = screen.getByTestId("store-readiness-builder");

    expect(screen.getByTestId("store-readiness-graphiql").textContent).toMatch(/playground/);
    expect(screen.getByTestId("store-readiness-graphiql").textContent).toMatch(/Open in GraphiQL/);
    expect(screen.getByTestId("store-readiness-graphiql-shortcut").textContent).toMatch(
      /⌘ \+ '|Ctrl \+ '/,
    );
    expect(within(builder).getByRole("button", { name: "Create custom app" })).toBeTruthy();
    expect(within(builder).queryByRole("button", { name: "Extensions" })).toBeNull();
    expect(within(builder).queryByRole("button", { name: /playground/i })).toBeNull();
  });

  it("shows go-live and Paper sections without counting them in progress", () => {
    renderBody(greenfield);

    expect(screen.getByTestId("store-readiness-go-live-section").textContent).toMatch(
      /Before you go live/,
    );
    expect(screen.getByTestId("store-readiness-paper-section").textContent).toMatch(
      /Connect Paper storefront/,
    );
    expect(screen.getByTestId("paper-logo")).toBeTruthy();
    expect(screen.getByTestId("store-readiness-paper-checklist").textContent).toMatch(
      /Production checklist/,
    );
    expect(screen.getByTestId("store-readiness-task-customer-email")).toBeTruthy();
    expect(screen.getByTestId("store-readiness-task-paper-deploy")).toBeTruthy();
    expect(screen.queryByTestId("store-readiness-task-paper-api")).toBeNull();
    expect(screen.getByTestId("store-readiness-progress").textContent).toContain("0 of 3");
  });

  it("shows a secondary CTA when a Paper guidance row is expanded", () => {
    renderBody(ready, false, "paper-deploy");

    expect(screen.getByTestId("store-readiness-guidance-cta").textContent).toMatch(
      /Deploy on Vercel/,
    );
    // Commerce primary CTA still only for the active optional test-order step.
    expect(screen.getAllByTestId("store-readiness-cta")).toHaveLength(1);
  });

  it("explains storefront Models without a CTA", () => {
    renderBody(ready, false, "paper-cms");

    expect(screen.getByTestId("store-readiness-task-details-paper-cms").textContent).toMatch(
      /Dashboard → Modeling/,
    );
    expect(screen.queryByTestId("store-readiness-guidance-cta")).toBeNull();
  });
});

describe("StoreReadinessSkeleton", () => {
  it("mirrors the two-card checklist layout while loading", () => {
    render(<StoreReadinessSkeleton />);

    const root = screen.getByTestId("store-readiness-loading");

    expect(root.getAttribute("aria-busy")).toBe("true");
    expect(root.getAttribute("aria-label")).toBe("Loading…");
    expect(root.querySelector("aside")).toBeTruthy();
    expect(root.querySelectorAll("ul").length).toBe(3);
  });
});
