import { getBaseUrl, SALEOR_API_URL_HEADER } from "@saleor/app-sdk/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { StripeConnectLinkUseCase } from "@/app/api/connect/link/use-case";
import { saleorApp } from "@/lib/saleor-app";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";

const body = z.object({
  account: z.string(),
  configId: z.string(),
});

const useCase = new StripeConnectLinkUseCase({
  repo: appConfigRepoImpl,
});

/**
 * todo how to make this secure?
 * 1. we need to first exeucte it from dashboard
 * 2. but in the end it's someone else who must open it
 * should we maybe:
 * 1. create session from the frontend with secret link and expiration time
 * 2. link shows UI part with input for account id (or should it be done by merchant in the dashboard?)
 * 3. submit form calls this endpoint with account id, session token etc
 */
export const POST = async function (req: NextRequest): Promise<NextResponse> {
  const bodyJson = await req.json();
  const parsedBody = body.safeParse(bodyJson);
  const baseUrl = getBaseUrl(req.headers); //todo

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: `Validation Error: ${parsedBody.error.message}` },
      { status: 400 },
    );
  }

  const stripeAccountToConnect = parsedBody.data.account;

  const authData = await saleorApp.apl.get(req.headers.get(SALEOR_API_URL_HEADER) as string);

  if (!authData) {
    throw new Error("No auth data found in request headers");
  }

  const result = await useCase.execute({
    stripeAccountToConnect: stripeAccountToConnect,
    configId: parsedBody.data.configId,
    appBaseUrl: baseUrl,
    authData: authData,
  });

  if (result.isOk()) {
    // this is redirect so it must happen on the frontend.
    return NextResponse.redirect(result.value);
  }
};
