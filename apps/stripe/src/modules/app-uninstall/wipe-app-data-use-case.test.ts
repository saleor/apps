import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { AppConfigRepoError } from "@/modules/app-config/repositories/app-config-repo";
import { WipeAppDataUseCase } from "@/modules/app-uninstall/wipe-app-data-use-case";
import {
  StripeWebhookManager,
  StripeWebhookManagerErrors,
} from "@/modules/stripe/stripe-webhook-manager";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

const access = { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId };

const makeUseCase = () => {
  const stripeWebhookManager = new StripeWebhookManager();
  const transactionRecorderRepo = new MockedTransactionRecorder();

  vi.spyOn(stripeWebhookManager, "removeWebhook").mockResolvedValue(ok(null));

  vi.spyOn(mockedAppConfigRepo, "getAllConfigs").mockResolvedValue(ok([mockedStripeConfig]));
  vi.spyOn(mockedAppConfigRepo, "removeAllConfigs").mockResolvedValue(ok(null));
  vi.spyOn(mockedAppConfigRepo, "removeAllChannelMappings").mockResolvedValue(ok(null));

  const removeAllForAppSpy = vi.spyOn(transactionRecorderRepo, "removeAllForApp");

  const useCase = new WipeAppDataUseCase({
    appConfigRepo: mockedAppConfigRepo,
    transactionRecorderRepo,
    stripeWebhookManager,
  });

  return {
    useCase,
    mockedAppConfigRepo,
    stripeWebhookManager,
    transactionRecorderRepo,
    removeAllForAppSpy,
  };
};

describe("WipeAppDataUseCase", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches configs, removes each Stripe webhook, and wipes all three Dynamo entities in parallel", async () => {
    const { useCase, mockedAppConfigRepo, stripeWebhookManager, removeAllForAppSpy } =
      makeUseCase();

    await useCase.execute(access);

    expect(mockedAppConfigRepo.getAllConfigs).toHaveBeenCalledWith(access);
    expect(stripeWebhookManager.removeWebhook).toHaveBeenCalledWith({
      webhookId: mockedStripeConfig.webhookId,
      restrictedKey: mockedStripeConfig.restrictedKey,
    });
    expect(mockedAppConfigRepo.removeAllConfigs).toHaveBeenCalledWith(access);
    expect(mockedAppConfigRepo.removeAllChannelMappings).toHaveBeenCalledWith(access);
    expect(removeAllForAppSpy).toHaveBeenCalledWith(access);
  });

  it("still wipes Dynamo entities when fetching configs fails (skips Stripe webhook removal)", async () => {
    const { useCase, mockedAppConfigRepo, stripeWebhookManager, removeAllForAppSpy } =
      makeUseCase();

    vi.spyOn(mockedAppConfigRepo, "getAllConfigs").mockResolvedValue(
      err(new AppConfigRepoError.FailureFetchingConfig("boom")),
    );

    await useCase.execute(access);

    expect(stripeWebhookManager.removeWebhook).not.toHaveBeenCalled();
    expect(mockedAppConfigRepo.removeAllConfigs).toHaveBeenCalledWith(access);
    expect(mockedAppConfigRepo.removeAllChannelMappings).toHaveBeenCalledWith(access);
    expect(removeAllForAppSpy).toHaveBeenCalledWith(access);
  });

  it("tolerates a failed Stripe webhook removal and continues with the other configs and DB wipes", async () => {
    const { useCase, mockedAppConfigRepo, stripeWebhookManager, removeAllForAppSpy } =
      makeUseCase();

    const secondConfig = { ...mockedStripeConfig, id: "config-2", webhookId: "wh_other" };

    vi.spyOn(mockedAppConfigRepo, "getAllConfigs").mockResolvedValue(
      ok([mockedStripeConfig, secondConfig as typeof mockedStripeConfig]),
    );

    vi.spyOn(stripeWebhookManager, "removeWebhook")
      .mockResolvedValueOnce(err(new StripeWebhookManagerErrors.CantRemoveWebhookError("nope")))
      .mockResolvedValueOnce(ok(null));

    await useCase.execute(access);

    expect(stripeWebhookManager.removeWebhook).toHaveBeenCalledTimes(2);
    expect(mockedAppConfigRepo.removeAllConfigs).toHaveBeenCalled();
    expect(removeAllForAppSpy).toHaveBeenCalled();
  });

  it("skips Stripe webhook removal when webhookId is missing on a config", async () => {
    const { useCase, mockedAppConfigRepo, stripeWebhookManager } = makeUseCase();

    const legacyConfig = { ...mockedStripeConfig, webhookId: "" };

    vi.spyOn(mockedAppConfigRepo, "getAllConfigs").mockResolvedValue(
      ok([legacyConfig as typeof mockedStripeConfig]),
    );

    await useCase.execute(access);

    expect(stripeWebhookManager.removeWebhook).not.toHaveBeenCalled();
  });

  it("does not throw when removeAllConfigs / removeAllChannelMappings / removeAllForApp all fail", async () => {
    const { useCase, mockedAppConfigRepo, transactionRecorderRepo } = makeUseCase();

    vi.spyOn(mockedAppConfigRepo, "removeAllConfigs").mockResolvedValue(
      err(new AppConfigRepoError.FailureRemovingConfig("a")),
    );
    vi.spyOn(mockedAppConfigRepo, "removeAllChannelMappings").mockResolvedValue(
      err(new AppConfigRepoError.FailureRemovingConfig("b")),
    );
    vi.spyOn(transactionRecorderRepo, "removeAllForApp").mockResolvedValue(
      err(new TransactionRecorderError.FailedRemovingTransactionsError("c")),
    );

    await expect(useCase.execute(access)).resolves.toBeUndefined();
  });

  it("does nothing destructive on an empty config list (still wipes other entities)", async () => {
    const { useCase, mockedAppConfigRepo, stripeWebhookManager, removeAllForAppSpy } =
      makeUseCase();

    vi.spyOn(mockedAppConfigRepo, "getAllConfigs").mockResolvedValue(ok([]));

    await useCase.execute(access);

    expect(stripeWebhookManager.removeWebhook).not.toHaveBeenCalled();
    expect(mockedAppConfigRepo.removeAllConfigs).toHaveBeenCalled();
    expect(mockedAppConfigRepo.removeAllChannelMappings).toHaveBeenCalled();
    expect(removeAllForAppSpy).toHaveBeenCalled();
  });
});
