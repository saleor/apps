import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

describe("TransactionRefundRequestedUseCaseResponse", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200 and refund success result with PSP reference", async () => {
      const response = new TransactionRefundRequestedUseCaseResponse.Success({
        transactionResult: new RefundSuccessResult(),
        atobaraiTransactionId: mockedAtobaraiTransactionId,
      });

      const fetchResponse = response.getResponse();

      expect(fetchResponse.status).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "message": "Successfully processed NP Atobarai transaction refund",
          "pspReference": "np_trans_id",
          "result": "REFUND_SUCCESS",
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 200 and refund failure result", async () => {
      const response = new TransactionRefundRequestedUseCaseResponse.Failure({
        transactionResult: new RefundFailureResult(),
      });

      const fetchResponse = response.getResponse();

      expect(fetchResponse.status).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "message": "Failed to process NP Atobarai transaction refund",
          "result": "REFUND_FAILURE",
        }
      `);
    });
  });
});
