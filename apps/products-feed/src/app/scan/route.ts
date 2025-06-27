import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { NextRequest } from "next/server";

import { apl } from "../../saleor-app";
import { ProcessingDto } from "../dto";
import { InstanceVerifier } from "./services/saleor-instance-verifier";

const isAuthorized = (req: NextRequest) =>
  req.headers.get("Authorization") === (process.env.CRON_SECRET as string);

/**
 * Execute by CRON, to periodically spawn work on data feed
 *
 * Must be GET - Vercel uses GET method
 */
export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return new Response("Not Authorized", { status: 401 });
  }

  const selfOrigin = (process.env.FORCE_BASE_URL as string) ?? new URL(req.url).origin;

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
        const graphqlClient = createGraphQLClient({
          saleorApiUrl: authData.saleorApiUrl,
          token: authData.token,
        });

        const instanceVerifier = new InstanceVerifier(graphqlClient);

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
    const urlToSpawn = new URL("/process-feed", selfOrigin);
    const dto: ProcessingDto = {
      authData: validAuthData,
    };

    void fetch(urlToSpawn, {
      headers: {
        ContentType: "application/json",
      },
      body: JSON.stringify(dto),
      method: "POST",
    });
  }

  return new Response("Accepted", {
    status: 202,
  });
};
