import Decimal from "decimal.js-light";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { OrderBaseFragment } from "@/generated/graphql";
import { filterEmptyValuesFromObject } from "@/lib/filter-empty-values-from-object";

export type TrackingBaseEvent = {
  type: string;
  user: {
    id: string;
    type: "logged" | "anonymous";
  };
  payload: Record<string, unknown>;
  issuedAt: string | null | undefined;
};

const getUserInfo = ({ user, userEmail }: OrderBaseFragment) => {
  const stringValidator = z.string().min(1);

  const userId = user?.id ?? userEmail;

  const parsedUserId = stringValidator.safeParse(userId);

  if (parsedUserId.success) {
    return {
      id: parsedUserId.data,
      type: "logged",
    } as const;
  }

  return {
    // https://segment.com/docs/guides/working-with-ids/#segments-guidance-on-identifier-formats
    id: uuidv4(),
    type: "anonymous",
  } as const;
};

const getProductInfo = (line: OrderBaseFragment["lines"][number]) => ({
  product_id: line.id,
  sku: line.productSku,
  category: line.variant?.product.category?.name,
  name: line.variant?.product.name,
  variant: line.variant?.name,
  price: line.totalPrice.gross.amount,
  quantity: line.quantity,
  coupon: line.voucherCode,
});

const getDiscount = (args: {
  total: OrderBaseFragment["total"];
  undiscountedTotal: OrderBaseFragment["undiscountedTotal"];
}) => new Decimal(args.total.gross.amount).sub(args.undiscountedTotal.gross.amount).toNumber();

/**
 * Semantic events from Segment:
 * https://segment.com/docs/connections/spec/ecommerce/v2/
 */
export const trackingEventFactory = {
  // https://segment.com/docs/connections/spec/ecommerce/v2/#order-updated
  createOrderUpdatedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Updated",
      user: getUserInfo(orderBase),
      issuedAt,
      payload: filterEmptyValuesFromObject({
        order_id: order.id,
        total: order.total.gross.amount,
        shipping: order.shippingPrice.gross.amount,
        tax: order.total.tax.amount,
        discount: getDiscount({
          total: order.total,
          undiscountedTotal: order.undiscountedTotal,
        }),
        coupon: order.voucherCode,
        currency: order.total.gross.currency,
        products: order.lines.map(getProductInfo),
      }),
    };
  },
  // https://segment.com/docs/connections/spec/ecommerce/v2/#order-cancelled
  createOrderCancelledEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Cancelled",
      user: getUserInfo(orderBase),
      issuedAt,
      payload: filterEmptyValuesFromObject({
        order_id: order.id,
        total: order.total.gross.amount,
        shipping: order.shippingPrice?.gross.amount,
        tax: order.total.tax.amount,
        discount: getDiscount({
          total: order.total,
          undiscountedTotal: order.undiscountedTotal,
        }),
        coupon: order.voucherCode,
        currency: order.total.gross.currency,
        products: order.lines.map(getProductInfo),
      }),
    };
  },
  // https://segment.com/docs/connections/spec/ecommerce/v2/#order-refunded
  createOrderRefundedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Refunded",
      user: getUserInfo(orderBase),
      issuedAt,
      payload: filterEmptyValuesFromObject({
        order_id: order.id,
        products: order.lines.map(getProductInfo),
      }),
    };
  },
  // https://segment.com/docs/connections/spec/ecommerce/v2/#order-completed
  createOrderCompletedEvent({
    orderBase,
    issuedAt,
  }: {
    orderBase: OrderBaseFragment;
    issuedAt: string | null | undefined;
  }): TrackingBaseEvent {
    const { user, userEmail, ...order } = orderBase;

    return {
      type: "Saleor Order Completed",
      user: getUserInfo(orderBase),
      issuedAt,
      payload: filterEmptyValuesFromObject({
        order_id: order.id,
        total: order.total.gross.amount,
        shipping: order.shippingPrice?.gross.amount,
        tax: order.total.tax.amount,
        discount: getDiscount({
          total: order.total,
          undiscountedTotal: order.undiscountedTotal,
        }),
        coupon: order.voucherCode,
        currency: order.total.gross.currency,
        products: order.lines.map(getProductInfo),
      }),
    };
  },
};
