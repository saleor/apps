import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { SetCategoryMappingInputSchema } from "./category-mapping-input-schema";
import { UpdateCategoryMappingDocument } from "../../../generated/graphql";
import { TRPCError } from "@trpc/server";
import { CategoriesFetcher } from "./categories-fetcher";

export const categoryMappingRouter = router({
  /**
   * Get all the category mappings to Google categories from its public metadata
   */
  getCategoryMappings: protectedClientProcedure.query(
    async ({ ctx: { logger, apiClient }, input }) => {
      const categoriesFetcher = new CategoriesFetcher(apiClient);

      const result = await categoriesFetcher.fetchAllCategories().catch((e) => {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch the categories",
        });
      });

      logger.debug("Returning categories");

      return result;
    },
  ),
  /**
   * Sets the Google category mapping for a given category in its public metadata
   */
  setCategoryMapping: protectedClientProcedure
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
        "Updated category mapping",
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
