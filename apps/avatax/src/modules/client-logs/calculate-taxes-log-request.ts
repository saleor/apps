import { ClientLogStoreRequest } from "./client-log";

export class CalculateTaxesLogRequest {
  static createSuccessLog(args: {
    sourceId: string;
    channelSlug: string;
    sourceType: "checkout" | "order";
    calculatedTaxesResult: Record<string, any>;
  }) {
    return ClientLogStoreRequest.create({
      level: "info",
      message: "Sucessfully calculated taxes",
      checkoutOrOrderId: args.sourceId,
      channelId: args.channelSlug,
      checkoutOrOrder: args.sourceType,
      attributes: {
        calculatedTaxes: args.calculatedTaxesResult,
      },
    });
  }

  static createErrorLog(args: {
    sourceId: string;
    channelSlug: string;
    sourceType: "checkout" | "order";
    errorReason: string;
  }) {
    return ClientLogStoreRequest.create({
      level: "error",
      message: "Error during tax calculation",
      checkoutOrOrderId: args.sourceId,
      channelId: args.channelSlug,
      checkoutOrOrder: args.sourceType,
      attributes: {
        error: {
          reason: args.errorReason,
        },
      },
    });
  }
}
