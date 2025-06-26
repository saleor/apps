import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { NextRequest } from "next/server";
import { Client } from "urql";

import { AppMeDocument } from "../../../generated/graphql";
import { apl } from "../../saleor-app";

// todo modern errors
class InstanceVerificationFailureError extends Error {}

class InstanceVerifier {
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

export interface ProcessingDto {
  authData: AuthData;
}

/**
 * Execute by CRON, to periodically spawn work on data feed
 */
export const POST = async (req: NextRequest) => {
  const selfUrl = new URL(req.url);

  /*
   * 1. Verify if source is cron
   * 2. get all APLs
   * 3. Get config from working apps -> check if token is valid
   * 4. Spawn lambda-per-env, fire and forget
   */

  const allInstalledInstances = await apl.getAll();
  const healthyInstances = (
    await Promise.all(
      allInstalledInstances.map((authData) => {
        const instanceVerifier = new InstanceVerifier(
          createGraphQLClient({
            saleorApiUrl: authData.saleorApiUrl,
            token: authData.token,
          }),
        );

        return instanceVerifier
          .ping(authData.appId)
          .then(() => authData)
          .catch(() => {
            return null;
          });
      }),
    )
  ).filter(Boolean) as AuthData[];

  for (const validAuthData of healthyInstances) {
    const urlToSpawn = new URL("/process-feed", selfUrl.origin);
    const dto: ProcessingDto = {
      authData: validAuthData,
    };

    void fetch(urlToSpawn, {
      headers: {
        ContentType: "application/json",
      },
      body: JSON.stringify(dto),
    });
  }

  return new Response("Accepted", {
    status: 202,
  });
};
