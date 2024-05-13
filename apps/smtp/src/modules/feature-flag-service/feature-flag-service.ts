import { Client } from "urql";
import { FeatureFlagsState, getFeatureFlags } from "./get-feature-flags";
import { fetchSaleorVersion } from "./fetch-saleor-version";
import { createLogger } from "../../logger";

const logger = createLogger("FeatureFlagService");

/**
 * Manages state of feature flags, based on Saleor version.
 * If `saleorVersion` is not provided, it will be fetched from the API on first call.
 * `saleorVersion` is expected to be in Semver format, e.g. "3.13.0"
 */
export class FeatureFlagService {
  private client: Client;
  private saleorVersion?: string;

  constructor(args: { client: Client; saleorVersion?: string }) {
    this.client = args.client;
    this.saleorVersion = args.saleorVersion;
  }

  public getSaleorVersion = async (): Promise<string> => {
    if (!this.saleorVersion) {
      logger.debug("No cached value, fetching version from the API");
      this.saleorVersion = await fetchSaleorVersion(this.client);
    }
    return this.saleorVersion;
  };

  public getFeatureFlags = async (): Promise<FeatureFlagsState> => {
    logger.debug("Checking feature flags");
    const saleorVersion = await this.getSaleorVersion();
    const flags = getFeatureFlags({ saleorVersion });

    logger.debug({ flags }, "Feature flags checked");
    return flags;
  };
}
