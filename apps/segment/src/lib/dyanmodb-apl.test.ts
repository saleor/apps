import { AuthData } from "@saleor/app-sdk/APL";
import { mockAuthData } from "@saleor/test-utils";
import { err } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BaseError } from "@/errors";

import { MemoryAPLRepository } from "../modules/db/__tests__/memory-apl-repository";
import { DynamoAPL } from "./dynamodb-apl";

describe("DynamoAPL", () => {
  const mockedAuthData = mockAuthData;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get auth data if it exists", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockedAuthData,
    });

    const result = await apl.get("saleorApiUrl");

    expect(result).toStrictEqual(mockedAuthData);
  });

  it("should return undefined if auth data does not exist", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.get("saleorApiUrl");

    expect(result).toBeUndefined();
  });

  it("should throw an error if getting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    vi.spyOn(repository, "getEntry").mockReturnValue(
      Promise.resolve(err(new BaseError("Error getting data"))),
    );

    await expect(apl.get("saleorApiUrl")).rejects.toThrowError(DynamoAPL.GetAuthDataError);
  });

  it("should set auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    const result = await apl.set(mockedAuthData);

    expect(result).toBeUndefined();

    const getEntryResult = await repository.getEntry({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
    });

    expect(getEntryResult._unsafeUnwrap()).toStrictEqual(mockedAuthData);
  });

  it("should throw an error if setting auth data fails", async () => {
    const repository = new MemoryAPLRepository();

    vi.spyOn(repository, "setEntry").mockResolvedValue(err(new BaseError("Error setting data")));

    const apl = new DynamoAPL({ repository });

    await expect(apl.set(mockedAuthData)).rejects.toThrowError(DynamoAPL.SetAuthDataError);
  });

  it("should update existing auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockedAuthData,
    });

    apl.set({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      token: "newAppToken",
      appId: "newSaleorAppId",
    });

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toStrictEqual({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      domain: "newSaleorDomain",
      appId: "newSaleorAppId",
      token: "newAppToken",
    });
  });

  it("should delete auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockedAuthData,
    });

    await apl.delete(mockedAuthData.saleorApiUrl);

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toBeUndefined();
  });

  it("should throw an error if deleting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({ repository });

    await expect(apl.delete("saleorApiUrl")).rejects.toThrowError(DynamoAPL.DeleteAuthDataError);
  });

  it("should get all auth data", async () => {
    const repository = new MemoryAPLRepository();
    const secondEntry: AuthData = {
      saleorApiUrl: "saleorApiUrl2",
      token: "appToken2",
      appId: "saleorAppId2",
    };
    const apl = new DynamoAPL({ repository });

    repository.setEntry({
      authData: mockedAuthData,
    });

    repository.setEntry({
      authData: secondEntry,
    });

    const result = await apl.getAll();

    expect(result).toStrictEqual([mockedAuthData, secondEntry]);
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
    vi.spyOn(await import("@/env"), "env", "get").mockReturnValue({
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
    vi.spyOn(await import("@/env"), "env", "get").mockReturnValue({
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
