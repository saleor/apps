import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";

import { AppChannelConfig } from "../domain/app-channel-config";

export type BaseAccessPattern = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

/**
 * Stripe webhook will provide ID of config from URL. Repo must be able to access it
 */
export type ConfigByChannelIdAccessPattern = BaseAccessPattern & {
  channelId: string;
};

/**
 * Saleor webhook will have available channel as access pattern. Repo must store channel<->config relation for this case
 */
export type ConfigByConfigIdAccessPattern = BaseAccessPattern & {
  configId: string;
};

export type GetChannelConfigAccessPattern =
  | ConfigByChannelIdAccessPattern
  | ConfigByConfigIdAccessPattern;

export const AppConfigRepoError = {
  FailureSavingConfig: BaseError.subclass("FailureSavingConfigError", {
    props: {
      _internalName: "AppConfigRepoError.FailureSavingConfigError",
    },
  }),
  FailureFetchingConfig: BaseError.subclass("FailureFetchingConfigError", {
    props: {
      _internalName: "AppConfigRepoError.FailureFetchingConfigError",
    },
  }),
  FailureRemovingConfig: BaseError.subclass("FailureRemovingConfigError", {
    props: {
      _internalName: "AppConfigRepoError.FailureRemovingConfig",
    },
  }),
};

export interface AppConfigRepo {
  saveChannelConfig: (args: {
    config: AppChannelConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) => Promise<Result<null | void, InstanceType<typeof AppConfigRepoError.FailureSavingConfig>>>;
  getChannelConfig: (
    access: GetChannelConfigAccessPattern,
  ) => Promise<
    Result<AppChannelConfig | null, InstanceType<typeof AppConfigRepoError.FailureFetchingConfig>>
  >;
  getRootConfig: (
    access: BaseAccessPattern,
  ) => Promise<
    Result<AppRootConfig, InstanceType<typeof AppConfigRepoError.FailureFetchingConfig>>
  >;
  removeConfig: (
    access: BaseAccessPattern,
    data: {
      configId: string;
    },
  ) => Promise<Result<null, InstanceType<typeof AppConfigRepoError.FailureRemovingConfig>>>;
  updateMapping: (
    access: BaseAccessPattern,
    data: {
      configId: string | null;
      channelId: string;
    },
  ) => Promise<Result<void | null, InstanceType<typeof AppConfigRepoError.FailureSavingConfig>>>;
}
