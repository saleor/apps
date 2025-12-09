import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAtobaraiCancelTransactionPayload } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-cancel-transaction-payload";
import { mockedAtobaraiChangeTransactionPayload } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-change-transaction-payload";
import { mockedAtobaraiRegisterTransactionPayload } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-register-transaction-payload";
import { mockedAtobaraiFulfillmentReportPayload } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-report-fulfillment-payload";
import { mockedAtobaraiMerchantCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiSecretSpCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-secret-sp-code";
import { mockedAtobaraiTerminalId } from "@/__tests__/mocks/atobarai/mocked-atobarai-terminal-id";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import { AtobaraiApiClient } from "./atobarai-api-client";
import { createAtobaraiCancelTransactionPayload } from "./atobarai-cancel-transaction-payload";
import {
  AtobaraiApiClientCancelTransactionError,
  AtobaraiApiClientChangeTransactionError,
  AtobaraiApiClientFulfillmentReportError,
  AtobaraiApiClientRegisterTransactionError,
  AtobaraiMultipleResultsError,
  IAtobaraiApiClient,
} from "./types";

const authorizationHeader = `Basic ${btoa(
  `${mockedAtobaraiMerchantCode}:${mockedAtobaraiSecretSpCode}`,
)}`;

const productionUrl = "https://cp.np-payment-gateway.com/v1/";
const sandboxUrl = "https://ctcp.np-payment-gateway.com/v1/";

describe("AtobaraiApiClient", () => {
  let sandboxClient: IAtobaraiApiClient;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    sandboxClient = AtobaraiApiClient.create({
      atobaraiTerminalId: mockedAtobaraiTerminalId,
      atobaraiMerchantCode: mockedAtobaraiMerchantCode,
      atobaraiSecretSpCode: mockedAtobaraiSecretSpCode,
      atobaraiEnvironment: "sandbox",
    });
  });

  describe("create", () => {
    it("should create an instance with all required parameters", () => {
      expect(sandboxClient).toBeInstanceOf(AtobaraiApiClient);
    });
  });

  describe("registerTransaction", () => {
    it("should make a POST request to the correct sandbox URL with proper headers and body", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      await sandboxClient.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions", sandboxUrl), {
        method: "POST",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiRegisterTransactionPayload),
      });
    });

    it("should make a POST request to the correct production URL", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const productionClient = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSecretSpCode: mockedAtobaraiSecretSpCode,
        atobaraiEnvironment: "production",
      });

      await productionClient.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions", productionUrl), {
        method: "POST",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiRegisterTransactionPayload),
      });
    });

    it("should return AtobaraiApiClientRegisterTransactionError when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await sandboxClient.registerTransaction(
        mockedAtobaraiRegisterTransactionPayload,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientRegisterTransactionError);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiApiClientRegisterTransactionError: Network error
          Failed to register transaction]
        `);
    });

    it("should return AtobaraiApiClientRegisterTransactionError result when response is not ok", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["invalid_request"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.registerTransaction(
        mockedAtobaraiRegisterTransactionPayload,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientRegisterTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientRegisterTransactionError: Atobarai API returned an error]`,
      );
    });

    it("should set apiError property when API returns an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["invalid_merchant_code", "another_error"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.registerTransaction(
        mockedAtobaraiRegisterTransactionPayload,
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AtobaraiApiClientRegisterTransactionError);

      if (error instanceof AtobaraiApiClientRegisterTransactionError) {
        expect(error.apiError).toBe("invalid_merchant_code");
      }
    });

    it("should return AtobaraiRegisterTransactionSuccessResponse when NP Atobarai responds with success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.registerTransaction(
        mockedAtobaraiRegisterTransactionPayload,
      );

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "authori_result": "00",
              "np_transaction_id": "np_trans_32",
            },
          ],
        }
      `);
    });

    it("should return AtobaraiMultipleResultsError when multiple results are found and rejectMultipleResults is set to true", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_21",
            authori_result: "00",
          },
          {
            np_transaction_id: "np_trans_37",
            authori_result: "20",
            authori_ng: "RE001",
          },
          {
            np_transaction_id: "np_trans_42",
            authori_result: "20",
            authori_ng: "RE002",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.registerTransaction(
        mockedAtobaraiRegisterTransactionPayload,
        {
          rejectMultipleResults: true,
        },
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiMultipleResultsError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiMultipleResultsError: Multiple results found]`,
      );
    });
  });

  describe("changeTransaction", () => {
    it("should make a PATCH request to the correct sandbox URL with proper headers and body", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions/update", sandboxUrl), {
        method: "PATCH",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiChangeTransactionPayload),
      });
    });

    it("should make a PATCH request to the correct production URL", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const productionClient = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSecretSpCode: mockedAtobaraiSecretSpCode,
        atobaraiEnvironment: "production",
      });

      await productionClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions/update", productionUrl), {
        method: "PATCH",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiChangeTransactionPayload),
      });
    });

    it("should return AtobaraiApiClientChangeTransactionError error when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientChangeTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiApiClientChangeTransactionError: Network error
          Failed to change transaction]
        `);
    });

    it("should return AtobaraiApiClientChangeTransactionError when response is not ok", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["invalid_request"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientChangeTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientChangeTransactionError: Atobarai API returned an error]`,
      );
    });

    it("should set apiError property when API returns an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["transaction_not_found", "another_error"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AtobaraiApiClientChangeTransactionError);

      if (error instanceof AtobaraiApiClientChangeTransactionError) {
        expect(error.apiError).toBe("transaction_not_found");
      }
    });

    it("should return AtobaraiTransactionSuccessResponse when NP Atobarai responds with success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "authori_result": "00",
              "np_transaction_id": "np_trans_32",
            },
          ],
        }
      `);
    });

    it("should return AtobaraiMultipleResultsError when multiple results are found and rejectMultipleResults is set to true", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
          {
            authori_result: "00",
            np_transaction_id: "np_trans_33",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.changeTransaction(mockedAtobaraiChangeTransactionPayload, {
        rejectMultipleResults: true,
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiMultipleResultsError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiMultipleResultsError: Multiple results found]
        `);
    });
  });

  describe("reportFulfillment", () => {
    it("should make a POST request to the correct sandbox URL with proper headers and body", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      await sandboxClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("shipments", sandboxUrl), {
        method: "POST",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiFulfillmentReportPayload),
      });
    });

    it("should make a POST request to the correct production URL", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const productionClient = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSecretSpCode: mockedAtobaraiSecretSpCode,
        atobaraiEnvironment: "production",
      });

      await productionClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(fetchSpy).toHaveBeenCalledWith(new URL("shipments", productionUrl), {
        method: "POST",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiFulfillmentReportPayload),
      });
    });

    it("should return AtobaraiApiClientFulfillmentReportError when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await sandboxClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientFulfillmentReportError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiApiClientFulfillmentReportError: Network error
          Failed to report fulfillment]
        `);
    });

    it("should return AtobaraiApiClientFulfillmentReportError when response is not ok", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["invalid_request"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientFulfillmentReportError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientFulfillmentReportError: Atobarai API returned an error]`,
      );
    });

    it("should return AtobaraiFulfillmentReportSuccessResponse when NP Atobarai responds with success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "np_transaction_id": "np_trans_32",
            },
          ],
        }
      `);
    });

    it("should return AtobaraiMultipleResultsError when multiple results are found and rejectMultipleResults is set to true", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
          {
            authori_result: "00",
            np_transaction_id: "np_trans_33",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.reportFulfillment(mockedAtobaraiFulfillmentReportPayload, {
        rejectMultipleResults: true,
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiMultipleResultsError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiMultipleResultsError: Multiple results found]
        `);
    });
  });

  describe("cancelTransaction", () => {
    it("should make a POST request to the correct sandbox URL with proper headers and body", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      await sandboxClient.cancelTransaction(
        createAtobaraiCancelTransactionPayload({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
      );

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions/cancel", sandboxUrl), {
        method: "PATCH",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiCancelTransactionPayload),
      });
    });

    it("should make a POST request to the correct production URL", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            np_transaction_id: "np_trans_32",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const productionClient = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSecretSpCode: mockedAtobaraiSecretSpCode,
        atobaraiEnvironment: "production",
      });

      await productionClient.cancelTransaction(
        createAtobaraiCancelTransactionPayload({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
      );

      expect(fetchSpy).toHaveBeenCalledWith(new URL("transactions/cancel", productionUrl), {
        method: "PATCH",
        headers: {
          "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockedAtobaraiCancelTransactionPayload),
      });
    });

    it("should return AtobaraiApiClientCancelTransactionError when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const result = await sandboxClient.cancelTransaction(
        createAtobaraiCancelTransactionPayload({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientCancelTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
          [AtobaraiApiClientCancelTransactionError: Network error
          Failed to cancel transaction]
        `);
    });

    it("should return AtobaraiApiClientCancelTransactionError when response is not ok", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json(
        {
          errors: [
            {
              codes: ["invalid_request"],
              id: "12345",
            },
          ],
        },
        { status: 400 },
      );

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.cancelTransaction(
        createAtobaraiCancelTransactionPayload({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientCancelTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientCancelTransactionError: Atobarai API returned an error]`,
      );
    });

    it("should return AtobaraiMultipleResultsError when multiple results are found and rejectMultipleResults is set to true", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "np_trans_32",
          },
          {
            authori_result: "00",
            np_transaction_id: "np_trans_33",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const result = await sandboxClient.cancelTransaction(
        createAtobaraiCancelTransactionPayload({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
        { rejectMultipleResults: true },
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiMultipleResultsError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiMultipleResultsError: Multiple results found]`,
      );
    });
  });
});
