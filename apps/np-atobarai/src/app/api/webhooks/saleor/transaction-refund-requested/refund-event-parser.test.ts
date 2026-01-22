import { beforeEach, describe, expect, it } from "vitest";

import { mockedRefundRequestedEvent } from "@/__tests__/mocks/saleor-events/mocked-refund-requested-event";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";

import { RefundEventParser } from "./refund-event-parser";

describe("RefundEventParser", () => {
  let parser: RefundEventParser;

  beforeEach(() => {
    parser = new RefundEventParser();
  });

  describe("parse", () => {
    it("should successfully parse a valid event", () => {
      const result = parser.parse(mockedRefundRequestedEvent);

      expect(result._unsafeUnwrap()).toStrictEqual({
        refundedAmount: mockedRefundRequestedEvent.action.amount,
        channelId: mockedRefundRequestedEvent.transaction?.order?.channel?.id,
        pspReference: mockedRefundRequestedEvent.transaction?.pspReference,
        sourceObjectTotalAmount: mockedRefundRequestedEvent.transaction?.order?.total.gross.amount,
        transactionToken: mockedRefundRequestedEvent.transaction?.token,
        issuedAt: mockedRefundRequestedEvent.issuedAt,
        sourceObject: mockedRefundRequestedEvent.transaction?.order,
        grantedRefund: mockedRefundRequestedEvent.grantedRefund,
        currency: mockedRefundRequestedEvent.action.currency,
        transactionTotalCharged: mockedRefundRequestedEvent.transaction?.chargedAmount.amount,
      });
    });

    it("should return error when refund amount is missing", () => {
      // @ts-expect-error - testing invalid input
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        action: { ...mockedRefundRequestedEvent.action, amount: null },
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[InvalidEventValidationError: Refund amount is required]`,
      );
    });

    it("should return error when PSP reference is empty", () => {
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        transaction: {
          ...mockedRefundRequestedEvent.transaction,
          pspReference: "",
        },
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[InvalidEventValidationError: PSP reference is required]`,
      );
    });

    it("should return error when transaction token is empty", () => {
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        transaction: {
          ...mockedRefundRequestedEvent.transaction,
          token: "",
        },
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[InvalidEventValidationError: Transaction token is required]`,
      );
    });

    it("should return error when issued at date is missing", () => {
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        issuedAt: null,
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[InvalidEventValidationError: Issued at date is required]`,
      );
    });

    it("should return error when transaction charged amount is missing", () => {
      const invalidEvent: TransactionRefundRequestedEventFragment = {
        ...mockedRefundRequestedEvent,
        transaction: {
          ...mockedRefundRequestedEvent.transaction,
          chargedAmount: {
            // @ts-expect-error - testing invalid input
            amount: null,
          },
        },
      };

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[InvalidEventValidationError: Transaction charged amount is required]`,
      );
    });
  });
});
