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
      });
    });

    it("should return error when refund amount is missing", () => {
      // @ts-expect-error - testing invalid input
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        action: { ...mockedRefundRequestedEvent.action, amount: null },
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        MalformedRequestResponse {
          "error": [BaseError: Refund amount is required],
          "message": "Malformed request",
          "statusCode": 500,
        }
      `);
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

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        MalformedRequestResponse {
          "error": [BaseError: PSP reference is required],
          "message": "Malformed request",
          "statusCode": 500,
        }
      `);
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

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        MalformedRequestResponse {
          "error": [BaseError: Transaction token is required],
          "message": "Malformed request",
          "statusCode": 500,
        }
      `);
    });

    it("should return error when issued at date is missing", () => {
      const invalidEvent = {
        ...mockedRefundRequestedEvent,
        issuedAt: null,
      } as TransactionRefundRequestedEventFragment;

      const result = parser.parse(invalidEvent);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        MalformedRequestResponse {
          "error": [BaseError: Issued at date is required],
          "message": "Malformed request",
          "statusCode": 500,
        }
      `);
    });
  });
});
