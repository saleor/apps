import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Logger } from "@saleor/apps-logger";
import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";

import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";

import { AppIsNotConfiguredResponse } from "./saleor-webhook-responses";

export abstract class BaseUseCase {
  protected abstract appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;
  protected abstract logger: Pick<Logger, "error" | "warn">;

  async getAtobaraiConfigForChannel({
    channelId,
    appId,
    saleorApiUrl,
  }: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }) {
    const atobaraiConfigForThisChannel = await this.appConfigRepo.getChannelConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: atobaraiConfigForThisChannel.error,
      });

      return err(new AppIsNotConfiguredResponse(atobaraiConfigForThisChannel.error));
    }

    if (!atobaraiConfigForThisChannel.value) {
      this.logger.warn("No configuration found for channel", {
        channelId,
      });

      return err(
        new AppIsNotConfiguredResponse(new BaseError("Configuration not found for channel")),
      );
    }

    return ok(atobaraiConfigForThisChannel.value);
  }
}
