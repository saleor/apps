import { createProtectedHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { NextResponse } from "next/server";

import { saleorApp } from "@/lib/saleor-app";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { StripeClient } from "@/modules/stripe/stripe-client";

// todo this can be troc
const handler = createProtectedHandler(async (request, ctx) => {
  const body = (await request.json()) as { configId: string };

  try {
    const config = await appConfigRepoImpl.getStripeConfig({
      configId: body.configId,
      appId: ctx.authData.appId,
      saleorApiUrl: createSaleorApiUrl(ctx.authData.saleorApiUrl),
    });

    if (config.isErr()) {
      // todo error handling
      throw new Error(`No config found`);
    }

    const stripe = StripeClient.createFromRestrictedKey(config.value!.restrictedKey);

    const account = await stripe.nativeClient.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
    });

    return NextResponse.json({ accountId: account.id });
  } catch (e) {
    console.error(e)

    return NextResponse.json({message: "error"}, {status: 500})
  }
}, saleorApp.apl);

export const POST = handler;
