import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { logger as pinoLogger } from "../../lib/logger";
import { SetCategoryMappingInputSchema } from "./category-mapping-input-schema";
import {
  FetchCategoriesWithMappingDocument,
  UpdateCategoryMappingDocument,
} from "../../../generated/graphql";
import { TRPCError } from "@trpc/server";

export const categoryMappingRouter = router({
  /**
   * Get all the category mappings to Google categories from its public metadata
   */
  getCategoryMappings: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("categoriesRouter.getCategoryMappings called");

    const result = await ctx.apiClient.query(FetchCategoriesWithMappingDocument, {}).toPromise();
    const categories = result.data?.categories?.edges?.map((edge) => edge.node) || [];

    if (result.error) {
      logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Can't fetch the categories",
      });
    }

    return categories;
  }),
  /**
   * Sets the Google category mapping for a given category in its public metadata
   */
  setCategoryMapping: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(SetCategoryMappingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug("categoriesRouter.setCategoryMapping called");
      const { error } = await ctx.apiClient
        .mutation(UpdateCategoryMappingDocument, {
          id: input.categoryId,
          googleCategoryId: input.googleCategoryId || "",
        })
        .toPromise();

      if (error) {
        logger.error(`Error during the GraphqlAPI call: ${error.message}`);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't save the category",
        });
      }

      return;
    }),
});
