import { afterEach, describe, expect, it, vi } from "vitest";

import { mockedAtobaraiChangeTransactionPayload } from "@/__tests__/mocks/atobarai/mocked-atobarai-change-transaction-payload";
import { mockedAtobaraiMerchantCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiRegisterTransactionPayload } from "@/__tests__/mocks/atobarai/mocked-atobarai-register-transaction-payload";
import { mockedAtobaraiFulfillmentReportPayload } from "@/__tests__/mocks/atobarai/mocked-atobarai-report-fulfilment-payload";
import { mockedAtobaraiSpCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-sp-code";
import { mockedAtobaraiTerminalId } from "@/__tests__/mocks/atobarai/mocked-atobarai-terminal-id";

import { AtobaraiApiClient } from "./atobarai-api-client";
import {
  AtobaraiApiClientChangeTransactionError,
  AtobaraiApiClientFulfillmentReportError,
  AtobaraiApiClientRegisterTransactionError,
} from "./types";

const authorizationHeader = `Basic ${btoa(
  `${mockedAtobaraiMerchantCode}:${mockedAtobaraiSpCode}`,
)}`;

describe("AtobaraiApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("create", () => {
    it("should create an instance with all required parameters", () => {
      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      expect(client).toBeInstanceOf(AtobaraiApiClient);
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("transactions", "https://ctcp.np-payment-gateway.com/v1/"),
        {
          method: "POST",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiRegisterTransactionPayload),
        },
      );
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "production",
      });

      await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("transactions", "https://cp.np-payment-gateway.com/v1/"),
        {
          method: "POST",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiRegisterTransactionPayload),
        },
      );
    });

    it("should return AtobaraiApiClientRegisterTransactionError when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientRegisterTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientRegisterTransactionError: Atobarai API returned an error]`,
      );
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      await client.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("transactions/update", "https://ctcp.np-payment-gateway.com/v1/"),
        {
          method: "PATCH",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiChangeTransactionPayload),
        },
      );
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "production",
      });

      await client.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("transactions/update", "https://cp.np-payment-gateway.com/v1/"),
        {
          method: "PATCH",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiChangeTransactionPayload),
        },
      );
    });

    it("should return AtobaraiApiClientChangeTransactionError error when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.changeTransaction(mockedAtobaraiChangeTransactionPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.changeTransaction(mockedAtobaraiChangeTransactionPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientChangeTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientChangeTransactionError: Atobarai API returned an error]`,
      );
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.changeTransaction(mockedAtobaraiChangeTransactionPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      await client.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("shipments", "https://ctcp.np-payment-gateway.com/v1/"),
        {
          method: "POST",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiFulfillmentReportPayload),
        },
      );
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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "production",
      });

      await client.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

      expect(fetchSpy).toHaveBeenCalledWith(
        new URL("shipments", "https://cp.np-payment-gateway.com/v1/"),
        {
          method: "POST",
          headers: {
            "X-NP-Terminal-Id": mockedAtobaraiTerminalId,
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mockedAtobaraiFulfillmentReportPayload),
        },
      );
    });

    it("should return AtobaraiApiClientFulfillmentReportError when fetch throws an error", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network error"));

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

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

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnvironment: "sandbox",
      });

      const result = await client.reportFulfillment(mockedAtobaraiFulfillmentReportPayload);

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
  });
});
