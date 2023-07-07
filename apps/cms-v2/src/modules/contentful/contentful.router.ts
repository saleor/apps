import { createGraphQLClient } from "@saleor/apps-shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSettingsManager } from "../configuration/metadata-manager";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import {
  ContentfulProviderConfigSchemaInput,
  ContentfulProviderConfigSchema,
} from "./config/contentful-config";
import { ContentfulSettingsManager } from "./config/contentful-settings-manager";
import { ContentfulClient } from "./contentful-client";

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
      contentfulSettingsManager: new ContentfulSettingsManager(settingsManager),
    },
  });
});

// todo extract services to context
export const contentfulRouter = router({
  fetchProviderConfiguration: procedure
    .input(
      z.object({
        providerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { contentfulSettingsManager } = ctx;

      const config = await contentfulSettingsManager.get();

      return config.getProviderById(input.providerId);
    }),
  addProvider: procedure
    .input(ContentfulProviderConfigSchemaInput)
    .mutation(async ({ input, ctx }) => {
      const { contentfulSettingsManager } = ctx;

      const config = await contentfulSettingsManager.get();

      config?.addProvider(input);

      return contentfulSettingsManager.set(config);
    }),
  updateProvider: procedure
    .input(ContentfulProviderConfigSchema)
    .mutation(async ({ input, ctx }) => {
      const { contentfulSettingsManager } = ctx;

      const config = await contentfulSettingsManager.get();

      config?.updateProvider(input);

      return contentfulSettingsManager.set(config);
    }),
  deleteProvider: procedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const { contentfulSettingsManager } = ctx;

    const config = await contentfulSettingsManager.get();

    config?.deleteProvider(input.id);

    return contentfulSettingsManager.set(config);
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
