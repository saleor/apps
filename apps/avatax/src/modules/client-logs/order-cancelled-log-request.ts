import { ClientLogStoreRequest } from "./client-log";

export class OrderCancelledLogRequest {
  static createSuccessLog(args: {
    sourceId: string | undefined;
    channelSlug: string | undefined;
    avataxId: string | undefined | null;
  }) {
    return ClientLogStoreRequest.create({
      level: "info",
      message: "Succesfully voided AvaTax transaction",
      checkoutOrOrderId: args.sourceId,
      channelId: args.channelSlug,
      checkoutOrOrder: "order",
      attributes: {
        ...(args.avataxId ? { avataxTransactionId: args.avataxId } : {}),
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
      message: "Failed to void AvaTax transaction",
      checkoutOrOrderId: args.sourceId,
      channelId: args.channelSlug,
      checkoutOrOrder: "order",
      attributes: {
        error: {
          reason: args.errorReason,
        },
        ...(args.avataxId ? { avataxTransactionId: args.avataxId } : {}),
      },
    });
  }
}
