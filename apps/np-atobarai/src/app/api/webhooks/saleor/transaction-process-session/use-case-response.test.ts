import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import {
  AtobaraiApiClientChangeTransactionError,
  AtobaraiMultipleResultsError,
} from "@/modules/atobarai/api/types";
import { SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { AtobaraiFailureTransactionError } from "../use-case-errors";
import { TransactionProcessSessionUseCaseResponse } from "./use-case-response";

describe("TransactionProcessSessionUseCaseResponse", () => {
  describe("Success", () => {
    describe("with ChargeSuccessResult", () => {
      it("getResponse() returns valid Response with status 200 and success result with PSP reference", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Success({
          transactionResult: new ChargeSuccessResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
          saleorPaymentMethodDetails: null,
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [
              "REFUND",
            ],
            "message": "Successfully changed NP Atobarai transaction",
            "pspReference": "np_trans_id",
            "result": "CHARGE_SUCCESS",
          }
        `);
      });
    });

    describe("with ChargeActionRequiredResult", () => {
      it("getResponse() returns valid Response with status 200 and action required result with PSP reference", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Success({
          transactionResult: new ChargeActionRequiredResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
          saleorPaymentMethodDetails: null,
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

    describe("with ChargeSuccessResult and non-null saleorPaymentMethodDetails", () => {
      it("getResponse() returns valid Response with status 200, success result, PSP reference, and payment method details", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Success({
          transactionResult: new ChargeSuccessResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
          saleorPaymentMethodDetails: new SaleorPaymentMethodDetails(),
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [
              "REFUND",
            ],
            "message": "Successfully changed NP Atobarai transaction",
            "paymentMethodDetails": {
              "name": "np_atobarai",
              "type": "OTHER",
            },
            "pspReference": "np_trans_id",
            "result": "CHARGE_SUCCESS",
          }
        `);
      });
    });

    describe("with ChargeActionRequiredResult and non-null saleorPaymentMethodDetails", () => {
      it("getResponse() returns valid Response with status 200, action required result, PSP reference, and payment method details", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Success({
          transactionResult: new ChargeActionRequiredResult(),
          atobaraiTransactionId: mockedAtobaraiTransactionId,
          saleorPaymentMethodDetails: new SaleorPaymentMethodDetails(),
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "message": "NP Atobarai transaction requires further action",
            "paymentMethodDetails": {
              "name": "np_atobarai",
              "type": "OTHER",
            },
            "pspReference": "np_trans_id",
            "result": "CHARGE_ACTION_REQUIRED",
          }
        `);
      });
    });
  });

  describe("Failure", () => {
    describe("with ChargeFailureResult and AtobaraiApiClientChangeTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and failure result with error details", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: new AtobaraiApiClientChangeTransactionError("API error occurred"),
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "data": {
              "errors": [
                {
                  "code": "AtobaraiChangeTransactionError",
                  "message": "Failed to change transaction with Atobarai",
                },
              ],
            },
            "message": "Failed to change NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });

    describe("with ChargeFailureResult and AtobaraiFailureTransactionError", () => {
      it("getResponse() returns valid Response with status 200 and failure result with transaction error details", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Failure({
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
            "message": "Failed to change NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });

    describe("with ChargeFailureResult and AtobaraiMultipleResultsError", () => {
      it("getResponse() returns valid Response with status 200 and multiple failure result with transaction error details", async () => {
        const response = new TransactionProcessSessionUseCaseResponse.Failure({
          transactionResult: new ChargeFailureResult(),
          error: new AtobaraiMultipleResultsError("Multiple failed transactions"),
        });

        const fetchResponse = response.getResponse();

        expect(fetchResponse.status).toBe(200);
        expect(await fetchResponse.json()).toMatchInlineSnapshot(`
          {
            "actions": [],
            "data": {
              "errors": [
                {
                  "code": "AtobaraiMultipleResultsError",
                  "message": "Atobarai returned multiple transactions",
                },
              ],
            },
            "message": "Failed to change NP Atobarai transaction",
            "result": "CHARGE_FAILURE",
          }
        `);
      });
    });
  });
});
