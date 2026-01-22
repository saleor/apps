import { err, ok, Result } from "neverthrow";

import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import {
  OrderGrantedRefundFragment,
  SourceObjectFragment,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";

export interface ParsedRefundEvent {
  refundedAmount: number;
  channelId: string;
  pspReference: string;
  sourceObjectTotalAmount: number;
  transactionToken: string;
  issuedAt: string;
  sourceObject: SourceObjectFragment;
  grantedRefund: OrderGrantedRefundFragment | null | undefined;
  currency: string;
  transactionTotalCharged: number;
}

export class RefundEventParser {
  parse(
    event: TransactionRefundRequestedEventFragment,
  ): Result<ParsedRefundEvent, InstanceType<typeof InvalidEventValidationError>> {
    if (!event.action.amount) {
      return err(
        new InvalidEventValidationError("Refund amount is required", {
          props: {
            publicMessage: "Refund amount is required",
          },
        }),
      );
    }

    if (!event.transaction?.pspReference) {
      return err(
        new InvalidEventValidationError("PSP reference is required", {
          props: {
            publicMessage: "PSP reference is required",
          },
        }),
      );
    }

    if (!event.transaction?.token) {
      return err(
        new InvalidEventValidationError("Transaction token is required", {
          props: {
            publicMessage: "Transaction token is required",
          },
        }),
      );
    }

    if (!event.issuedAt) {
      return err(
        new InvalidEventValidationError("Issued at date is required", {
          props: {
            publicMessage: "Issued at date is required",
          },
        }),
      );
    }

    const sourceObjectTotalAmount =
      event.transaction.checkout?.totalPrice.gross.amount ||
      event.transaction.order?.total.gross.amount;

    if (!sourceObjectTotalAmount) {
      return err(
        new InvalidEventValidationError("Total amount is required", {
          props: {
            publicMessage: "Total amount is required",
          },
        }),
      );
    }

    const channelId =
      event.transaction.checkout?.channel?.id || event.transaction.order?.channel?.id;

    if (!channelId) {
      return err(
        new InvalidEventValidationError("Channel ID is required", {
          props: {
            publicMessage: "Channel ID is required",
          },
        }),
      );
    }

    const sourceObject = event.transaction.checkout || event.transaction.order;

    if (!sourceObject) {
      return err(
        new InvalidEventValidationError("Source object (checkout or order) is required", {
          props: {
            publicMessage: "Source object (checkout or order) is required",
          },
        }),
      );
    }

    if (!event.transaction.chargedAmount?.amount) {
      return err(
        new InvalidEventValidationError("Transaction charged amount is required", {
          props: {
            publicMessage: "Transaction charged amount is required",
          },
        }),
      );
    }

    return ok({
      refundedAmount: event.action.amount,
      channelId,
      pspReference: event.transaction.pspReference,
      sourceObjectTotalAmount,
      transactionToken: event.transaction.token,
      issuedAt: event.issuedAt,
      sourceObject: sourceObject as SourceObjectFragment,
      grantedRefund: event.grantedRefund,
      currency: event.action.currency,
      transactionTotalCharged: event.transaction.chargedAmount.amount,
    });
  }
}
