import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { AtobaraiApiClientRegisterTransactionError } from "@/modules/atobarai/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import {
  AtobaraiFailureTransactionError,
  AtobaraiMultipleFailureTransactionError,
} from "../use-case-errors";
import { TransactionInitializeSessionUseCaseResponse } from "./use-case-response";

describe("TransactionInitializeSessionUseCaseResponse", () => {
  describe("Success", () => {
    describe("with ChargeSuccessResult", () => {
      it("getResponse() returns valid Response with status 200 and success result with PSP reference", async () => {
        const response = new TransactionInitializeSessionUseCaseResponse.Success({
          transactionResult: new ChargeSuccessResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [
              "REFUND",
            ],
            "message": "Successfully registered NP Atobarai transaction",
            "pspReference": "np_trans_id",
            "result": "CHARGE_SUCCESS",
          }
        `);
      });
    });

    describe("with ChargeActionRequiredResult", () => {
      it("getResponse() returns valid Response with status 200 and action required result with PSP reference", async () => {
        const response = new TransactionInitializeSessionUseCaseResponse.Success({
          transactionResult: new ChargeActionRequiredResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "message": "NP Atobarai transaction requires further action",
            "pspReference": "np_trans_id",
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
            "message": "Failed to register NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });

    describe("with ChargeFailureResult and AtobaraiFailureTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and failure result with transaction error details", async () => {
        const response = new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: new AtobaraiFailureTransactionError("Pending status"),
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
                  "message": "Atobarai returned failed transaction",
                },
              ],
            },
            "message": "Failed to register NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });

    describe("with ChargeFailureResult and AtobaraiMultipleFailureTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and multiple failure result with transaction error details", async () => {
        const response = new TransactionInitializeSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: new AtobaraiMultipleFailureTransactionError("Multiple failed transactions"),
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "data": {
              "errors": [
                {
                  "code": "AtobaraiMultipleFailureTransactionError",
                  "message": "Atobarai returned multiple transactions",
                },
              ],
            },
            "message": "Failed to register NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });
  });
});
