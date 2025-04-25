import { TRPCError } from "@trpc/server";

import { StripeFrontendConfig } from "@/modules/app-config/domain/stripe-config";
import { dynamoDbChannelConfigMappingEntity } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { dynamoDbStripeConfigEntity } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

// todo test
export class GetStripeConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

      /**
       * TODO: Extract such logic to be shared between handlers
       * TODO CTX should have already created SaleorApiUrl instance, not Result
       */
      if (saleorApiUrl.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Malformed request",
        });
      }

      const config = await new DynamodbAppConfigRepo({
        entities: {
          stripeConfig: dynamoDbStripeConfigEntity,
          channelConfigMapping: dynamoDbChannelConfigMappingEntity,
        },
      }).getRootConfig({
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
      });

      /*
       * todo restore and put dynamo to ctx
       * const config = await ctx.configRepo.getRootConfig({
       *   saleorApiUrl: saleorApiUrl.value,
       *   appId: ctx.appId,
       * });
       */

      if (config.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "App failed to fetch config, please contact Saleor",
        });
      }

      return config.value
        .getAllConfigsAsList()
        .map((config) => StripeFrontendConfig.createFromStripeConfig(config));
    });
  }
}
