import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
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
  getCategoryMappings: protectedClientProcedure.query(
    async ({ ctx: { logger, apiClient }, input }) => {
      /**
       * Does it fetch all categories? No pagination todo
       */
      const result = await apiClient.query(FetchCategoriesWithMappingDocument, {}).toPromise();
      const categories = result.data?.categories?.edges?.map((edge) => edge.node) || [];

      if (result.error) {
        logger.error(`Error during the GraphqlAPI call: ${result.error.message}`);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch the categories",
        });
      }

      logger.debug("Returning categories");

      return categories;
    }
  ),
  /**
   * Sets the Google category mapping for a given category in its public metadata
   */
  setCategoryMapping: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(SetCategoryMappingInputSchema)
    .mutation(async ({ ctx: { logger, apiClient }, input }) => {
      const { error } = await apiClient
        .mutation(UpdateCategoryMappingDocument, {
          id: input.categoryId,
          googleCategoryId: input.googleCategoryId || "",
        })
        .toPromise();

      logger.debug(
        {
          input,
        },
        "Updated category mapping"
      );

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
