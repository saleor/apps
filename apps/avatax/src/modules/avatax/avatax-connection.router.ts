import { z } from "zod";

import { metadataCache } from "@/lib/app-metadata-cache";
import { Obfuscator } from "@/lib/obfuscator";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxObfuscator } from "@/modules/avatax/avatax-obfuscator";
import { AvataxConnectionService } from "@/modules/avatax/configuration/avatax-connection.service";
import { AvataxConnectionRepository } from "@/modules/avatax/configuration/avatax-connection-repository";
import { AvataxPatchInputTransformer } from "@/modules/avatax/configuration/avatax-patch-input-transformer";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { createLogger } from "../../logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AvataxClient } from "./avatax-client";
import { avataxConfigSchema, baseAvataxConfigSchema } from "./avatax-connection-schema";
import { AvataxErrorToTrpcErrorMapper } from "./avatax-error-mapper";
import { AvataxSdkClientFactory } from "./avatax-sdk-client-factory";
import { AvataxAddressValidationService } from "./configuration/avatax-address-validation.service";
import { AvataxAuthValidationService } from "./configuration/avatax-auth-validation.service";
import { AvataxEditAddressValidationService } from "./configuration/avatax-edit-address-validation.service";
import { AvataxEditAuthValidationService } from "./configuration/avatax-edit-auth-validation.service";
import { PublicAvataxConnectionService } from "./configuration/public-avatax-connection.service";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: avataxConfigSchema.deepPartial(),
});

const postInputSchema = z.object({
  value: avataxConfigSchema,
});

const avataxErrorsToTrpcErrorsMapper = new AvataxErrorToTrpcErrorMapper();

const protectedWithConnectionService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      connectionService: new PublicAvataxConnectionService(
        new AvataxConnectionService(
          new AvataxConnectionRepository(
            new CrudSettingsManager({
              saleorApiUrl: ctx.saleorApiUrl,
              metadataKey: TAX_PROVIDER_KEY,
              metadataManager: createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
            }),
          ),
        ),
        new AvataxObfuscator(),
      ),
    },
  }),
);

export const avataxConnectionRouter = router({
  verifyConnections: protectedWithConnectionService.query(async ({ ctx }) => {
    const logger = createLogger("avataxConnectionRouter.verifyConnections");

    logger.debug("Route verifyConnections called");

    await ctx.connectionService.verifyConnections();

    logger.info("AvaTax connections were successfully verified");

    return { ok: true };
  }),
  getById: protectedWithConnectionService.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("avataxConnectionRouter.get");

    logger.debug("Route get called");

    const result = await ctx.connectionService.getById(input.id);

    logger.info(`AvaTax configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  create: protectedWithConnectionService.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger("avataxConnectionRouter.post", {
      saleorApiUrl: ctx.saleorApiUrl,
    });

    logger.debug("Attempting to create configuration");

    const result = await ctx.connectionService.create(input.value);

    logger.info("AvaTax configuration was successfully created");

    return result;
  }),
  delete: protectedWithConnectionService
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.delete", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug("Route delete called");

      const result = await ctx.connectionService.delete(input.id);

      logger.info(`AvaTax configuration with an id: ${input.id} was deleted`);

      return result;
    }),
  update: protectedWithConnectionService
    .input(patchInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.patch", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug("Route patch called");

      const result = await ctx.connectionService.update(input.id, input.value);

      logger.info(`AvaTax configuration with an id: ${input.id} was successfully updated`);

      return result;
    }),
  /*
   * There are separate methods for address validation for edit and create
   * because some form values in the edit form can be obfuscated.
   * When calling the "editValidateAddress", we are checking if the credentials
   * are obfuscated. If they are, we use the stored credentials and mix them with
   * unobfuscated values from the form.
   */
  editValidateAddress: protectedClientProcedure
    .input(z.object({ value: avataxConfigSchema, id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.editValidateAddress", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug("Route called");

      const addressValidationService = new AvataxEditAddressValidationService(
        new AvataxPatchInputTransformer(
          new AvataxConnectionService(
            new AvataxConnectionRepository(
              new CrudSettingsManager({
                saleorApiUrl: ctx.saleorApiUrl,
                metadataKey: TAX_PROVIDER_KEY,
                metadataManager: createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
              }),
            ),
          ),
          new Obfuscator(),
        ),
      );

      const result = await addressValidationService.validate(input.id, input.value);

      return result.match(
        (value) => {
          logger.debug(`AvaTax address was successfully validated`);

          return value;
        },
        (error) => {
          throw avataxErrorsToTrpcErrorsMapper.mapError(error);
        },
      );
    }),
  createValidateAddress: protectedWithConnectionService
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.createValidateAddress", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug("Route called");

      const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(input.value));

      const addressValidation = new AvataxAddressValidationService(avataxClient);

      const result = await addressValidation.validate(input.value.address);

      return result.match(
        (value) => {
          logger.debug(`AvaTax address was successfully validated`);

          return value;
        },
        (error) => {
          throw avataxErrorsToTrpcErrorsMapper.mapError(error);
        },
      );
    }),
  /*
   * There are separate methods for credentials validation for edit and create
   * because some form values in the edit form can be obfuscated.
   * When calling the "editValidateCredentials", we are checking if the credentials
   * are obfuscated. If they are, we use the stored credentials and mix them with
   * unobfuscated values from the form.
   */
  editValidateCredentials: protectedClientProcedure
    .input(z.object({ value: baseAvataxConfigSchema, id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.validateAuth", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      const authValidation = new AvataxEditAuthValidationService(
        new AvataxPatchInputTransformer(
          new AvataxConnectionService(
            new AvataxConnectionRepository(
              new CrudSettingsManager({
                saleorApiUrl: ctx.saleorApiUrl,
                metadataKey: TAX_PROVIDER_KEY,
                metadataManager: createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
              }),
            ),
          ),
          new Obfuscator(),
        ),
      );

      await authValidation.validate(input.id, input.value);

      logger.info(`AvaTax client was successfully validated`);
    }),
  createValidateCredentials: protectedClientProcedure
    .input(z.object({ value: baseAvataxConfigSchema }))
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxConnectionRouter.createValidateAuth", {
        saleorApiUrl: ctx.saleorApiUrl,
      });
      const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(input.value));

      const authValidationService = new AvataxAuthValidationService(avataxClient);

      const result = await authValidationService.testConnection();

      return result.match(
        (value) => {
          logger.debug(`AvaTax client was successfully validated`);

          return value;
        },
        (error) => {
          throw avataxErrorsToTrpcErrorsMapper.mapError(error);
        },
      );
    }),
});
