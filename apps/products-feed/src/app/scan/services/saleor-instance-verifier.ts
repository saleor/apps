import { Client } from "urql";

import { AppMeDocument } from "../../../../generated/graphql";

export class InstanceVerificationFailureError extends Error {}

/**
 * Verifies if token and appId is valid
 */
export class InstanceVerifier {
  constructor(private client: Client) {}

  ping(appId: string) {
    return this.client
      .query(AppMeDocument, {})
      .toPromise()
      .then((res) => {
        const idsMatching = res.data?.app?.id === appId;

        if (!idsMatching) {
          throw new InstanceVerificationFailureError("Failed to verify app");
        }
      })
      .catch((e) => {
        throw new InstanceVerificationFailureError("Failed to verify app", { cause: e });
      });
  }
}
