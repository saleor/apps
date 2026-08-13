import { type StoreReadinessQuery } from "@/generated/graphql";

import { SMTP_APP_IDENTIFIER } from "./go-live-copy";

export type CommerceTaskId = "sales-channel" | "first-product" | "payments" | "test-order";

export type TaskStatus = "active" | "completed" | "locked" | "optional";

export type StoreReadiness = {
  /** First channel by API order — treated as the default setup target. */
  channelId: string | null;
  channelName: string | null;
  hasChannels: boolean;
  hasWarehouse: boolean;
  hasShipping: boolean;
  channelReady: boolean;
  hasProduct: boolean;
  hasPaymentApp: boolean;
  hasOrder: boolean;
  /** Installed SMTP app GraphQL id, when `saleor.app.smtp` is active. */
  smtpAppId: string | null;
  /** False when the corresponding field was missing (permission / error). */
  channelsKnown: boolean;
  shippingKnown: boolean;
  productsKnown: boolean;
  paymentsKnown: boolean;
  ordersKnown: boolean;
};

export type CommerceTask = {
  id: CommerceTaskId;
  status: TaskStatus;
  /** Required steps count toward progress; optional does not. */
  required: boolean;
};

const isPaymentApp = (app: {
  isActive?: boolean | null;
  type?: string | null;
  permissions?: ReadonlyArray<{ readonly code: string } | null> | null;
}): boolean => {
  if (!app.isActive || app.type !== "THIRDPARTY") return false;

  return Boolean(app.permissions?.some((permission) => permission?.code === "HANDLE_PAYMENTS"));
};

export const getStoreReadiness = (data: StoreReadinessQuery | undefined): StoreReadiness => {
  const channelsKnown = data?.channels !== undefined && data.channels !== null;
  const channels = data?.channels ?? [];
  const primaryChannel = channels[0] ?? null;

  const shippingKnown = data?.shippingZones !== undefined && data.shippingZones !== null;
  const shippingChannelIds = new Set(
    (data?.shippingZones?.edges ?? []).flatMap((edge) =>
      (edge.node.channels ?? []).map((channel) => channel.id),
    ),
  );

  const hasWarehouse = (primaryChannel?.warehouses.length ?? 0) > 0;
  const hasShipping = primaryChannel ? shippingChannelIds.has(primaryChannel.id) : false;

  const productsKnown = data?.products !== undefined && data.products !== null;
  const paymentsKnown = data?.apps !== undefined && data.apps !== null;
  const ordersKnown = data?.orders !== undefined && data.orders !== null;

  const appEdges = data?.apps?.edges ?? [];
  const hasPaymentApp = appEdges.some((edge) => isPaymentApp(edge.node));
  const smtpAppId =
    appEdges.find((edge) => edge.node.identifier === SMTP_APP_IDENTIFIER)?.node.id ?? null;

  return {
    channelId: primaryChannel?.id ?? null,
    channelName: primaryChannel?.name ?? null,
    hasChannels: channels.length > 0,
    hasWarehouse,
    hasShipping,
    channelReady: Boolean(primaryChannel && hasWarehouse && (!shippingKnown || hasShipping)),
    hasProduct: (data?.products?.totalCount ?? 0) > 0,
    hasPaymentApp,
    hasOrder: (data?.orders?.totalCount ?? 0) > 0,
    smtpAppId,
    channelsKnown,
    shippingKnown,
    productsKnown,
    paymentsKnown,
    ordersKnown,
  };
};

/**
 * Derive checklist task statuses from live store readiness.
 * Required spine: sales channel → product → payments. Test order is optional.
 */
export const getCommerceTasks = (readiness: StoreReadiness): CommerceTask[] => {
  const channelStatus: TaskStatus = !readiness.channelsKnown
    ? "locked"
    : readiness.channelReady
    ? "completed"
    : "active";

  const productStatus: TaskStatus = !readiness.productsKnown
    ? "locked"
    : readiness.hasProduct
    ? "completed"
    : readiness.channelReady
    ? "active"
    : "locked";

  const paymentsStatus: TaskStatus = !readiness.paymentsKnown
    ? "locked"
    : readiness.hasPaymentApp
    ? "completed"
    : readiness.hasProduct
    ? "active"
    : "locked";

  const testOrderStatus: TaskStatus = readiness.hasOrder ? "completed" : "optional";

  return [
    { id: "sales-channel", status: channelStatus, required: true },
    { id: "first-product", status: productStatus, required: true },
    { id: "payments", status: paymentsStatus, required: true },
    { id: "test-order", status: testOrderStatus, required: false },
  ];
};

export const getReadinessProgress = (tasks: CommerceTask[]) => {
  const required = tasks.filter((task) => task.required);

  return {
    done: required.filter((task) => task.status === "completed").length,
    total: required.length,
  };
};

export const getActiveCommerceTaskId = (tasks: CommerceTask[]): CommerceTaskId | null =>
  tasks.find((task) => task.status === "active")?.id ??
  tasks.find((task) => task.status === "optional" && task.id === "test-order")?.id ??
  null;
