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

// todo extract services to context
export const contentfulRouter = router({
  fetchProviderConfiguration: protectedClientProcedure
    .input(
      z.object({
        providerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const client = createGraphQLClient({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });

      const mm = createSettingsManager(client, ctx.appId!);

      const settingsManager = new ContentfulSettingsManager(mm);
      const config = await settingsManager.get();

      return config.getProviderById(input.providerId);
    }),
  addProvider: protectedClientProcedure
    .input(ContentfulProviderConfigSchemaInput)
    .mutation(async ({ input, ctx }) => {
      const client = createGraphQLClient({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });

      const mm = createSettingsManager(client, ctx.appId!);

      const settingsManager = new ContentfulSettingsManager(mm);

      const config = await settingsManager.get();

      config?.addProvider(input);

      return settingsManager.set(config);
    }),
  updateProvider: protectedClientProcedure
    .input(ContentfulProviderConfigSchema)
    .mutation(async ({ input, ctx }) => {
      const client = createGraphQLClient({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });

      const mm = createSettingsManager(client, ctx.appId!);

      const settingsManager = new ContentfulSettingsManager(mm);

      const config = await settingsManager.get();

      config?.updateProvider(input);

      return settingsManager.set(config);
    }),

  fetchEnvironmentsFromApi: protectedClientProcedure
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
  fetchContentTypesFromApi: protectedClientProcedure
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
