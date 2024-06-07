import Algolia from "algoliasearch";
import { createLogger } from "../logger";

export interface IAlgoliaCredentialsVerifier {
  verifyCredentials(params: { apiKey: string; appId: string }): Promise<void>;
}

export class AlgoliaCredentialsVerifier implements IAlgoliaCredentialsVerifier {
  private logger = createLogger("AlgoliaCredentialsVerifier");

  async verifyCredentials(params: { apiKey: string; appId: string }) {
    const client = Algolia(params.appId, params.apiKey);

    await client
      .getApiKey(params.apiKey, { cacheable: false })
      .then()
      .catch((r) => {
        this.logger.debug("Algolia call failed");

        throw new Error("Failed to verify algolia credentials", {
          cause: r,
        });
      });
  }
}

export const algoliaCredentialsVerifier = new AlgoliaCredentialsVerifier();
