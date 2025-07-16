import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { RandomId } from "@/lib/random-id";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { newConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-config-input-schema";
import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";
import { IAtobaraiApiClientFactory } from "@/modules/atobarai/types";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class NewConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private atobaraiClientFactory: IAtobaraiApiClientFactory;

  constructor(deps: { atobaraiClientFactory: IAtobaraiApiClientFactory }) {
    this.atobaraiClientFactory = deps.atobaraiClientFactory;
  }

  getTrpcProcedure() {
    return this.baseProcedure.input(newConfigInputSchema).mutation(async ({ input, ctx }) => {
      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

      if (!ctx.appUrl) {
        captureException(new BaseError("Missing appUrl in TRPC request"));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong, please contact support.",
        });
      }

      const configId = new RandomId().generate();

      const configToSaveResult = AppChannelConfig.create({
        name: input.name,
        id: configId,
        spCode: createAtobaraiSpCode(input.spCode),
        shippingCompanyCode: input.shippingCompanyCode,
        skuAsName: input.skuAsName,
        terminalId: createAtobaraiTerminalId(input.terminalId),
        useSandbox: input.useSandbox,
        merchantCode: createAtobaraiMerchantCode(input.merchantCode),
        fillMissingAddress: input.fillMissingAddress,
      });

      if (configToSaveResult.isErr()) {
        captureException(
          new BaseError(
            "Handler validation triggered outside of input validation. This means input validation is leaky.",
          ),
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create configuration: ${configToSaveResult.error.message}`,
        });
      }

      const configToSave = configToSaveResult.value;

      const atobaraiApiClient = this.atobaraiClientFactory.create({
        atobaraiTerminalId: configToSave.terminalId,
        atobaraiEnvironment: configToSave.useSandbox ? "sandbox" : "production",
        atobaraiSpCode: configToSave.spCode,
        atobaraiMerchantCode: configToSave.merchantCode,
      });

      const validationResult = await atobaraiApiClient.verifyCredentials();

      if (validationResult.isErr()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Provided Atobarai credentials are invalid. Please check your SP Code, Merchant Code, and Terminal ID.",
        });
      }

      const saveResult = await ctx.configRepo.saveChannelConfig({
        config: configToSave,
        saleorApiUrl: saleorApiUrl,
        appId: ctx.appId,
      });

      if (saveResult.isErr()) {
        captureException(saveResult.error);

        // TODO Handle exact errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create configuration. Data can't be saved.",
        });
      }
    });
  }
}
