import Algolia from "algoliasearch";

import { createLogger } from "../logger";
import { createTraceEffect } from "../trace-effect";
import { ALGOLIA_SLOW_THRESHOLD_MS } from "../trace-effect-thresholds";

export interface IAlgoliaCredentialsVerifier {
  verifyCredentials(params: { apiKey: string; appId: string }): Promise<void>;
}

export class AlgoliaCredentialsVerifier implements IAlgoliaCredentialsVerifier {
  private logger = createLogger("AlgoliaCredentialsVerifier");
  private traceGetApiKey = createTraceEffect({
    name: "Algolia getApiKey",
    slowThresholdMs: ALGOLIA_SLOW_THRESHOLD_MS,
  });

  async verifyCredentials(params: { apiKey: string; appId: string }) {
    const client = Algolia(params.appId, params.apiKey);

    await this.traceGetApiKey(() => client.getApiKey(params.apiKey, { cacheable: false }), {
      appId: params.appId,
    }).catch((r) => {
      this.logger.debug("Algolia call failed");

      throw new Error("Failed to verify algolia credentials", {
        cause: r,
      });
    });
  }
}

export const algoliaCredentialsVerifier = new AlgoliaCredentialsVerifier();
