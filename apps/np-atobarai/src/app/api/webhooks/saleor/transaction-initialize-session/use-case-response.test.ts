import { describe, expect, it } from "vitest";

import {
  FailedAtobaraiTransaction,
  PassedAtobaraiTransaction,
  PendingAtobaraiTransaction,
} from "@/modules/atobarai/atobarai-transaction";
import { AtobaraiApiClientRegisterTransactionError } from "@/modules/atobarai/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { TransactionInitializeSessionUseCaseResponse } from "./use-case-response";

describe("TransactionInitializeSessionUseCaseResponse", () => {
  describe("Success", () => {
    describe("with ChargeSuccessResult", () => {
      it("getResponse() returns valid Response with status 200 and success result with PSP reference", async () => {
        const mockedAtobaraiTransaction =
          PassedAtobaraiTransaction.createFromAtobaraiTransactionResponse({
            np_transaction_id: "np_transaction_123",
            authori_result: "00",
          });
        const response = new TransactionInitializeSessionUseCaseResponse.Success({
          transactionResult: new ChargeSuccessResult(),
          atobaraiTransaction: mockedAtobaraiTransaction,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [
              "REFUND",
            ],
            "message": "Successfully registered a NP Atobarai transaction",
            "pspReference": "np_transaction_123",
            "result": "CHARGE_SUCCESS",
          }
        `);
      });
    });

    describe("with ChargeActionRequiredResult", () => {
      it("getResponse() returns valid Response with status 200 and action required result with PSP reference", async () => {
        const mockedAtobaraiTransaction =
          PendingAtobaraiTransaction.createFromAtobaraiTransactionResponse({
            np_transaction_id: "np_transaction_456",
            authori_result: "10",
            authori_hold: [],
          });
        const response = new TransactionInitializeSessionUseCaseResponse.Success({
          transactionResult: new ChargeActionRequiredResult(),
          atobaraiTransaction: mockedAtobaraiTransaction,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "message": "NP Atobarai transaction requires further action",
            "pspReference": "np_transaction_456",
            "result": "CHARGE_ACTION_REQUIRED",
          }
        `);
      });
    });
  });

  describe("Failure", () => {
    describe("with ChargeFailureResult and AtobaraiApiClientRegisterTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and failure result with error details", async () => {
        const error = new AtobaraiApiClientRegisterTransactionError("API error occurred");
        const response = new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "data": {
              "errors": [
                {
                  "code": "AtobaraiRegisterTransactionError",
                  "message": "Failed to register transaction with Atobarai",
                },
              ],
            },
            "message": "Failed to register a NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });

    describe("with ChargeFailureResult and AtobaraiFailureTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and failure result with transaction error details", async () => {
        const transaction = FailedAtobaraiTransaction.createFromAtobaraiTransactionResponse({
          np_transaction_id: "np_transaction_789",
          authori_result: "20",
          authori_ng: FailedAtobaraiTransaction.creditCheckReasons.Other,
        });

        const response = new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          atobaraiTransaction: transaction,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "data": {
              "errors": [
                {
                  "code": "AtobaraiFailureTransactionError",
                  "message": "Atobarai credit check failed",
                },
              ],
            },
            "message": "Failed to register a NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });
  });
});
