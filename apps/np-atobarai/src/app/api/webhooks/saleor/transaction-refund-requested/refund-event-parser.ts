import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";

import {
  OrderGrantedRefundFragment,
  SourceObjectFragment,
  TransactionRefundRequestedEventFragment,
} from "@/generated/graphql";

import { InvalidEventDataResponse } from "../saleor-webhook-responses";

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
}

export class RefundEventParser {
  parse(
    event: TransactionRefundRequestedEventFragment,
  ): Result<ParsedRefundEvent, InvalidEventDataResponse> {
    if (!event.action.amount) {
      return err(new InvalidEventDataResponse(new BaseError("Refund amount is required")));
    }

    if (!event.transaction?.pspReference) {
      return err(new InvalidEventDataResponse(new BaseError("PSP reference is required")));
    }

    if (!event.transaction?.token) {
      return err(new InvalidEventDataResponse(new BaseError("Transaction token is required")));
    }

    if (!event.issuedAt) {
      return err(new InvalidEventDataResponse(new BaseError("Issued at date is required")));
    }

    const sourceObjectTotalAmount =
      event.transaction.checkout?.totalPrice.gross.amount ||
      event.transaction.order?.total.gross.amount;

    if (!sourceObjectTotalAmount) {
      return err(new InvalidEventDataResponse(new BaseError("Total amount is required")));
    }

    const channelId =
      event.transaction.checkout?.channel?.id || event.transaction.order?.channel?.id;

    if (!channelId) {
      return err(new InvalidEventDataResponse(new BaseError("Channel ID is required")));
    }

    const sourceObject = event.transaction.checkout || event.transaction.order;

    if (!sourceObject) {
      return err(
        new InvalidEventDataResponse(
          new BaseError("Source object (checkout or order) is required"),
        ),
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
    });
  }
}
