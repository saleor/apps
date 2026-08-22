import { describe, expect, it } from "vitest";

import { type StoreReadinessQuery } from "@/generated/graphql";

import {
  getActiveCommerceTaskId,
  getCommerceTasks,
  getReadinessProgress,
  getStoreReadiness,
} from "./get-store-readiness";

const baseData = {
  channels: [
    {
      id: "Q2hhbm5lbDox",
      name: "Default Channel",
      warehouses: [{ id: "V2FyZWhvdXNlOjE=" }],
    },
  ],
  shippingZones: {
    edges: [
      {
        node: {
          channels: [{ id: "Q2hhbm5lbDox" }],
        },
      },
    ],
  },
  products: { totalCount: 0 },
  apps: { edges: [] },
  orders: { totalCount: 0 },
} satisfies StoreReadinessQuery;

describe("getStoreReadiness", () => {
  it("marks channel ready when warehouse and shipping are present", () => {
    const readiness = getStoreReadiness(baseData);

    expect(readiness.channelReady).toBe(true);
    expect(readiness.hasWarehouse).toBe(true);
    expect(readiness.hasShipping).toBe(true);
    expect(readiness.hasProduct).toBe(false);
  });

  it("detects payment apps with HANDLE_PAYMENTS", () => {
    const readiness = getStoreReadiness({
      ...baseData,
      apps: {
        edges: [
          {
            node: {
              id: "QXBwOjE=",
              identifier: "saleor.app.payment.dummy",
              type: "THIRDPARTY",
              isActive: true,
              permissions: [{ code: "HANDLE_PAYMENTS" }],
            },
          },
        ],
      },
    });

    expect(readiness.hasPaymentApp).toBe(true);
  });

  it("ignores local apps even with HANDLE_PAYMENTS", () => {
    const readiness = getStoreReadiness({
      ...baseData,
      apps: {
        edges: [
          {
            node: {
              id: "QXBwOjE=",
              identifier: null,
              type: "LOCAL",
              isActive: true,
              permissions: [{ code: "HANDLE_PAYMENTS" }],
            },
          },
        ],
      },
    });

    expect(readiness.hasPaymentApp).toBe(false);
  });

  it("detects the installed SMTP app by identifier", () => {
    const readiness = getStoreReadiness({
      ...baseData,
      apps: {
        edges: [
          {
            node: {
              id: "QXBwOjQy",
              identifier: "saleor.app.smtp",
              type: "THIRDPARTY",
              isActive: true,
              permissions: [{ code: "MANAGE_USERS" }],
            },
          },
        ],
      },
    });

    expect(readiness.hasSmtpApp).toBe(true);
  });

  it("detects the installed Stripe payment app by identifier", () => {
    const readiness = getStoreReadiness({
      ...baseData,
      apps: {
        edges: [
          {
            node: {
              id: "QXBwOlN0cmlwZQ==",
              identifier: "saleor.app.payment.stripe",
              type: "THIRDPARTY",
              isActive: true,
              permissions: [{ code: "HANDLE_PAYMENTS" }],
            },
          },
        ],
      },
    });

    expect(readiness.hasStripeApp).toBe(true);
    expect(readiness.hasPaymentApp).toBe(true);
  });
});

describe("getCommerceTasks", () => {
  it("unlocks product after channel is ready", () => {
    const tasks = getCommerceTasks(getStoreReadiness(baseData));

    expect(tasks.find((task) => task.id === "sales-channel")?.status).toBe("completed");
    expect(tasks.find((task) => task.id === "first-product")?.status).toBe("active");
    expect(tasks.find((task) => task.id === "payments")?.status).toBe("locked");
  });

  it("counts only required steps in progress", () => {
    const tasks = getCommerceTasks(
      getStoreReadiness({
        ...baseData,
        products: { totalCount: 2 },
        apps: {
          edges: [
            {
              node: {
                id: "QXBwOjE=",
                identifier: "saleor.app.payment.dummy",
                type: "THIRDPARTY",
                isActive: true,
                permissions: [{ code: "HANDLE_PAYMENTS" }],
              },
            },
          ],
        },
      }),
    );

    expect(getReadinessProgress(tasks)).toStrictEqual({ done: 3, total: 3 });
    expect(getActiveCommerceTaskId(tasks)).toBe("test-order");
  });

  it("locks steps when GraphQL fields are missing (permission / error)", () => {
    const readiness = getStoreReadiness({
      channels: null,
      shippingZones: null,
      products: null,
      apps: null,
      orders: null,
    } as unknown as StoreReadinessQuery);

    expect(readiness.channelsKnown).toBe(false);
    expect(readiness.shippingKnown).toBe(false);
    expect(readiness.productsKnown).toBe(false);
    expect(readiness.paymentsKnown).toBe(false);

    const tasks = getCommerceTasks(readiness);

    expect(tasks.find((task) => task.id === "sales-channel")?.status).toBe("locked");
    expect(tasks.find((task) => task.id === "first-product")?.status).toBe("locked");
    expect(tasks.find((task) => task.id === "payments")?.status).toBe("locked");
  });

  it("treats skipped shipping query like ChannelSetupCard (warehouse is enough)", () => {
    const readiness = getStoreReadiness({
      ...baseData,
      shippingZones: null,
    } as unknown as StoreReadinessQuery);

    expect(readiness.shippingKnown).toBe(false);
    expect(readiness.channelReady).toBe(true);
    expect(getCommerceTasks(readiness).find((task) => task.id === "sales-channel")?.status).toBe(
      "completed",
    );
  });
});
