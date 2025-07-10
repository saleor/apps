import { trace } from "@opentelemetry/api";
import { AuthData } from "@saleor/app-sdk/APL";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DynamoAPL } from "./dynamodb-apl";
import { MemoryAPLRepository } from "./memory-apl-repository";
import { mockedAuthData } from "./mocks/mocked-auth-data";

const mockTracer = trace.getTracer("test");

describe("DynamoAPL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get auth data if it exists", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    const result = await apl.get(mockedAuthData.saleorApiUrl);

    expect(result).toStrictEqual(mockedAuthData);
  });

  it("should return undefined if auth data does not exist", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.get(mockedAuthData.saleorApiUrl);

    expect(result).toBeUndefined();
  });

  it("should throw an error if getting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    vi.spyOn(repository, "getEntry").mockReturnValue(
      Promise.reject(new Error("Error getting data")),
    );

    await expect(apl.get(mockedAuthData.saleorApiUrl)).rejects.toThrowError(
      DynamoAPL.GetAuthDataError,
    );
  });

  it("should set auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.set(mockedAuthData);

    expect(result).toBeUndefined();

    const getEntryResult = await repository.getEntry({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
    });

    expect(getEntryResult).toStrictEqual(mockedAuthData);
  });

  it("should throw an error if setting auth data fails", async () => {
    const repository = new MemoryAPLRepository();

    vi.spyOn(repository, "setEntry").mockRejectedValue(new Error("Error setting data"));

    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await expect(apl.set(mockedAuthData)).rejects.toThrowError(DynamoAPL.SetAuthDataError);
  });

  it("should update existing auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await apl.set({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    });

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toStrictEqual({
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    });
  });

  it("should delete auth data", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await apl.delete(mockedAuthData.saleorApiUrl);

    const getEntryResult = await apl.get(mockedAuthData.saleorApiUrl);

    expect(getEntryResult).toBeUndefined();
  });

  it("should throw an error if deleting auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await expect(apl.delete(mockedAuthData.saleorApiUrl)).rejects.toThrowError(
      DynamoAPL.DeleteAuthDataError,
    );
  });

  it("should get all auth data", async () => {
    const repository = new MemoryAPLRepository();
    const secondEntry: AuthData = {
      saleorApiUrl: "https://foo-bar.cloud/graphql/",
      token: mockedAuthData.token,
      appId: mockedAuthData.appId,
    };
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    await repository.setEntry({
      authData: mockedAuthData,
    });

    await repository.setEntry({
      authData: secondEntry,
    });

    const result = await apl.getAll();

    expect(result).toStrictEqual([mockedAuthData, secondEntry]);
  });

  it("should throw an error if getting all auth data fails", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    vi.spyOn(repository, "getAllEntries").mockRejectedValueOnce(new Error("Error getting data"));

    await expect(apl.getAll()).rejects.toThrowError(DynamoAPL.GetAllAuthDataError);
  });

  it("should return ready:true when APL related env variables are set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.isReady();

    expect(result).toStrictEqual({ ready: true });
  });

  it("should return ready:false when APL related env variables are not set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "access_key_id",
        AWS_REGION: "region",
        AWS_SECRET_ACCESS_KEY: "secret_access_key",
        // @ts-expect-error - testing missing env variables
        APL_TABLE_NAME: undefined,
      },
    });

    const result = await apl.isReady();

    expect(result).toStrictEqual({
      ready: false,
      error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
    });
  });

  it("should return configured:true when APL related env variables are set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        APL_TABLE_NAME: "",
      },
    });

    const result = await apl.isConfigured();

    expect(result).toStrictEqual({ configured: true });
  });

  it("should return configured:false when APL related env variables are not set", async () => {
    const repository = new MemoryAPLRepository();
    const apl = new DynamoAPL({
      repository,
      tracer: mockTracer,
      env: {
        AWS_ACCESS_KEY_ID: "",
        AWS_REGION: "",
        AWS_SECRET_ACCESS_KEY: "",
        // @ts-expect-error - testing missing env variables
        APL_TABLE_NAME: undefined,
      },
    });

    const result = await apl.isConfigured();

    expect(result).toStrictEqual({
      configured: false,
      error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
    });
  });
});
