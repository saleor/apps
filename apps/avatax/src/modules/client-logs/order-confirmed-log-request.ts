import { ClientLogStoreRequest } from "./client-log";

export class OrderConfirmedLogRequest {
  static createSuccessLog(args: {
    sourceId: string | undefined;
    channelSlug: string | undefined;
    avataxId: string;
  }) {
    return ClientLogStoreRequest.create({
      level: "info",
      message: "AvaTax transaction committed successfully",
      checkoutOrOrderId: args.sourceId,
      checkoutOrOrder: "order",
      channelId: args.channelSlug,
      attributes: {
        avataxTransactionId: args.avataxId,
      },
    });
  }

  static createErrorLog(args: {
    sourceId: string | undefined;
    channelSlug: string | undefined;
    errorReason: string;
    avataxId?: string | null;
  }) {
    return ClientLogStoreRequest.create({
      level: "error",
      message: "Failed to commit transaction in AvaTax",
      checkoutOrOrderId: args.sourceId,
      checkoutOrOrder: "order",
      channelId: args.channelSlug,
      attributes: {
        error: {
          reason: args.errorReason,
        },
      },
    });
  }
}
