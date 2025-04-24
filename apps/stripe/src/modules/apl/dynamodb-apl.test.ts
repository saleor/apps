import { AuthData } from "@saleor/app-sdk/APL";
import { err } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockedAppToken, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { MemoryAPLRepository } from "@/__tests__/mocks/memory-apl-repository";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { BaseError } from "@/lib/errors";

import { DynamoAPL } from "./dynamodb-apl";

describe("DynamoAPL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get auth data if it exists", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockAuthData,
    });

    const result = await apl.get(mockedSaleorApiUrl);

    expect(result).toStrictEqual(mockAuthData);
  });

  it("should return undefined if auth data does not exist", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.get(mockedSaleorApiUrl);

    expect(result).toBeUndefined();
  });

  it("should throw an error if getting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    vi.spyOn(repository, "getEntry").mockReturnValue(
      Promise.resolve(err(new BaseError("Error getting data"))),
    );

    await expect(apl.get(mockedSaleorApiUrl)).rejects.toThrowError(DynamoAPL.GetAuthDataError);
  });

  it("should set auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.set(mockAuthData);

    expect(result).toBeUndefined();

    const getEntryResult = await repository.getEntry({
      saleorApiUrl: mockedSaleorApiUrl,
    });

    expect(getEntryResult._unsafeUnwrap()).toStrictEqual(mockAuthData);
  });

  it("should throw an error if setting auth data fails", async () => {
    const repository = new MemoryAPLRepository();

    vi.spyOn(repository, "setEntry").mockResolvedValue(err(new BaseError("Error setting data")));

    const apl = new DynamoAPL({ repository });

    await expect(apl.set(mockAuthData)).rejects.toThrowError(DynamoAPL.SetAuthDataError);
  });

  it("should update existing auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockAuthData,
    });

    apl.set({
      saleorApiUrl: mockAuthData.saleorApiUrl,
      token: mockedAppToken,
      appId: mockedSaleorAppId,
    });

    const getEntryResult = await apl.get(mockAuthData.saleorApiUrl);

    expect(getEntryResult).toStrictEqual({
      saleorApiUrl: mockAuthData.saleorApiUrl,
      token: mockedAppToken,
      appId: mockedSaleorAppId,
    });
  });

  it("should delete auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockAuthData,
    });

    await apl.delete(mockAuthData.saleorApiUrl);

    const getEntryResult = await apl.get(mockAuthData.saleorApiUrl);

    expect(getEntryResult).toBeUndefined();
  });

  it("should throw an error if deleting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    await expect(apl.delete(mockedSaleorApiUrl)).rejects.toThrowError(
      DynamoAPL.DeleteAuthDataError,
    );
  });

  it("should get all auth data", async () => {
    const repository = new MemoryAPLRepository();
    const secondEntry: AuthData = {
      saleorApiUrl: "https://foo-bar.cloud/graphql/",
      token: mockedAppToken,
      appId: mockedSaleorAppId,
    };
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockAuthData,
    });

    repository.setEntry({
      authData: secondEntry,
    });

    const result = await apl.getAll();

    expect(result).toStrictEqual([mockAuthData, secondEntry]);
  });

  it("should throw an error if getting all auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    vi.spyOn(repository, "getAllEntries").mockResolvedValue(
      err(new BaseError("Error getting data")),
    );

    await expect(apl.getAll()).rejects.toThrowError(DynamoAPL.GetAllAuthDataError);
  });

  it("should return ready:true when APL related env variables are set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.isReady();

    expect(result).toStrictEqual({ ready: true });
  });

  it("should return ready:false when APL related env variables are not set", async () => {
    vi.spyOn(await import("@/lib/env"), "env", "get").mockReturnValue({
      // @ts-expect-error - testing missing env variables
      DYNAMODB_MAIN_TABLE_NAME: undefined,
      AWS_REGION: "region",
      AWS_ACCESS_KEY_ID: "access_key_id",
      AWS_SECRET_ACCESS_KEY: "secret_access_key",
      APL: "dynamodb",
      APP_LOG_LEVEL: "info",
      MANIFEST_APP_ID: "",
      OTEL_ENABLED: false,
      PORT: 0,
      SECRET_KEY: "",
      NODE_ENV: "test",
      ENV: "local",
    });
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.isReady();

    expect(result).toStrictEqual({
      ready: false,
      error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
    });
  });

  it("should return configured:true when APL related env variables are set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.isConfigured();

    expect(result).toStrictEqual({ configured: true });
  });

  it("should return configured:false when APL related env variables are not set", async () => {
    vi.spyOn(await import("@/lib/env"), "env", "get").mockReturnValue({
      // @ts-expect-error - testing missing env variables
      DYNAMODB_MAIN_TABLE_NAME: undefined,
      APL: "dynamodb",
      APP_LOG_LEVEL: "info",
      MANIFEST_APP_ID: "",
      OTEL_ENABLED: false,
      PORT: 0,
      SECRET_KEY: "",
      NODE_ENV: "test",
      ENV: "local",
    });

    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.isConfigured();

    expect(result).toStrictEqual({
      configured: false,
      error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
    });
  });
});
