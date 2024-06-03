import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AppConfigMetadataManager } from "../../configuration/app-config-metadata-manager";

import { createSettingsManager } from "../../configuration/metadata-manager";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";

import { ContentfulClient } from "./contentful-client";
import { createLogger } from "@/logger";

const procedure = protectedClientProcedure.use(({ ctx, next }) => {
  const settingsManager = createSettingsManager(ctx.apiClient, ctx.appId!);

  return next({
    ctx: {
      settingsManager,
      appConfigService: new AppConfigMetadataManager(settingsManager),
    },
  });
});

/**
 * Operations specific for Contentful service.
 *
 * For configruration see providers-list.router.ts
 */
export const contentfulRouter = router({
  fetchEnvironmentsFromApi: procedure
    .input(
      z.object({
        contentfulToken: z.string(),
        contentfulSpace: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const logger = createLogger("contentfulRouter.fetchEnvironmentsFromApi");

      logger.debug("Fetching environments from API");

      const client = new ContentfulClient({
        accessToken: input.contentfulToken,
        space: input.contentfulSpace,
      });

      try {
        const environments = await client.getEnvironments();

        logger.info("Environments fetched successfully", { environments });

        return environments;
      } catch (e) {
        logger.error("Failed to fetch environments", { error: e });

        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    }),
  fetchContentTypesFromApi: procedure
    .input(
      z.object({
        contentfulToken: z.string(),
        contentfulSpace: z.string(),
        contentfulEnv: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const logger = createLogger("contentfulRouter.fetchContentTypesFromApi");

      logger.debug("Fetching content types from API");

      const client = new ContentfulClient({
        accessToken: input.contentfulToken,
        space: input.contentfulSpace,
      });

      try {
        const contentTypes = await client.getContentTypes(input.contentfulEnv);

        logger.info("Content types fetched successfully", { contentTypes });

        return contentTypes;
      } catch (e) {
        logger.error("Failed to fetch content types", { error: e });

        throw new TRPCError({ code: "BAD_REQUEST" });
      }
    }),
});
