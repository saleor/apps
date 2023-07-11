import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";

import { createSettingsManager } from "../configuration/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";

import { ContentfulClient } from "./contentful-client";
import { ContentfulProviderSchema } from "../configuration/schemas/contentful-provider.schema";
import { DatocmsProviderSchema } from "../configuration/schemas/datocms-provider.schema";
import { DatoCMSClient } from "./datocms-client";

// todo extract and share procedure

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
      appConfigService: new AppConfigMetadataManager(settingsManager),
    },
  });
});

// todo probably move and share CRUD operations and keep router for specific stuff like validation
export const datocmsRouter = router({
  // todo move to providers list, its not related to provider type
  fetchProviderConfiguration: procedure
    .input(
      z.object({
        providerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const config = await ctx.appConfigService.get();

      return config.providers.getProviderById(input.providerId);
    }),
  // todo probably also move to providers CRUD?
  addProvider: procedure
    .input(DatocmsProviderSchema.ConfigInput)
    .mutation(async ({ input, ctx }) => {
      const config = await ctx.appConfigService.get();

      config?.providers.addProvider(input);

      return ctx.appConfigService.set(config);
    }),
  // todo probably also move to providers CRUD?
  updateProvider: procedure.input(DatocmsProviderSchema.Config).mutation(async ({ input, ctx }) => {
    const config = await ctx.appConfigService.get();

    config?.providers.updateProvider(input);

    return ctx.appConfigService.set(config);
  }),
  // todo probably also move to providers CRUD?
  deleteProvider: procedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const { appConfigService, settingsManager } = ctx;

    const config = await ctx.appConfigService.get();

    config.providers.deleteProvider(input.id);

    return ctx.appConfigService.set(config);
  }),

  fetchContentTypes: procedure
    .input(
      z.object({
        apiToken: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const client = new DatoCMSClient({
        apiToken: input.apiToken,
      });

      return client.getContentTypes();
    }),
  fetchContentTypeFields: procedure
    .input(
      z.object({
        contentTypeID: z.string(),
        apiToken: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const client = new DatoCMSClient({
        apiToken: input.apiToken,
      });

      return client.getFieldsForContentType({
        itemTypeID: input.contentTypeID,
      });
    }),
});
