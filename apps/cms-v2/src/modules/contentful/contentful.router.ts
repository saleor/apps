import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AppConfigMetadataManager } from "../configuration/app-config-metadata-manager";

import { createSettingsManager } from "../configuration/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";

import { ContentfulClient } from "./contentful-client";
import { ContentfulProviderSchema } from "../configuration/schemas/contentful-provider.schema";

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
      appConfigService: new AppConfigMetadataManager(settingsManager),
    },
  });
});

export const contentfulRouter = router({
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
  addProvider: procedure
    .input(ContentfulProviderSchema.ConfigInput)
    .mutation(async ({ input, ctx }) => {
      const config = await ctx.appConfigService.get();

      config?.providers.addProvider(input);

      return ctx.appConfigService.set(config);
    }),
  updateProvider: procedure
    .input(ContentfulProviderSchema.Config)
    .mutation(async ({ input, ctx }) => {
      const config = await ctx.appConfigService.get();

      config?.providers.updateProvider(input);

      return ctx.appConfigService.set(config);
    }),
  deleteProvider: procedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const { appConfigService, settingsManager } = ctx;

    const config = await ctx.appConfigService.get();

    config.providers.deleteProvider(input.id);

    return ctx.appConfigService.set(config);
  }),

  fetchEnvironmentsFromApi: procedure
    .input(
      z.object({
        contentfulToken: z.string(),
        contentfulSpace: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const client = new ContentfulClient({
        accessToken: input.contentfulToken,
        space: input.contentfulSpace,
      });

      return client.getEnvironments();
    }),
  fetchContentTypesFromApi: procedure
    .input(
      z.object({
        contentfulToken: z.string(),
        contentfulSpace: z.string(),
        contentfulEnv: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const client = new ContentfulClient({
        accessToken: input.contentfulToken,
        space: input.contentfulSpace,
      });

      return client.getContentTypes(input.contentfulEnv).catch((e) => {
        console.error(e);

        throw new TRPCError({ code: "BAD_REQUEST" });
      });
    }),
});
