import { afterEach, describe, expect, it, vi } from "vitest";

import { mockedAtobaraiMerchantCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-merchant-code";
import { mockedAtobaraiRegisterTransactionPayload } from "@/__tests__/mocks/atobarai/mocked-atobarai-register-transaction-payload";
import { mockedAtobaraiSpCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-sp-code";
import { mockedAtobaraiTerminalId } from "@/__tests__/mocks/atobarai/mocked-atobarai-terminal-id";

import { AtobaraiApiClient } from "./atobarai-api-client";
import { AtobaraiApiClientRegisterTransactionError } from "./types";

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
            np_transaction_id: "1234567890",
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
            np_transaction_id: "1234567890",
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

    it("should return error result when fetch throws an error", async () => {
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

    it("should return error result when response is not ok", async () => {
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
        atobaraiEnviroment: "sandbox",
      });

      const result = await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AtobaraiApiClientRegisterTransactionError);
      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
        `[AtobaraiApiClientRegisterTransactionError: Atobarai API returned an error]`,
      );
    });

    it("should return AtobaraiRegisterTransactionSuccessResponse when NP Atobarai responds success", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const mockResponse = Response.json({
        results: [
          {
            authori_result: "00",
            np_transaction_id: "1234567890",
          },
        ],
      });

      fetchSpy.mockResolvedValue(mockResponse);

      const client = AtobaraiApiClient.create({
        atobaraiTerminalId: mockedAtobaraiTerminalId,
        atobaraiMerchantCode: mockedAtobaraiMerchantCode,
        atobaraiSpCode: mockedAtobaraiSpCode,
        atobaraiEnviroment: "sandbox",
      });

      const result = await client.registerTransaction(mockedAtobaraiRegisterTransactionPayload);

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        {
          "results": [
            {
              "authori_result": "00",
              "np_transaction_id": "1234567890",
            },
          ],
        }
      `);
    });
  });
});
