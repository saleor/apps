import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { SetCategoryMappingInputSchema } from "./category-mapping-input-schema";
import { UpdateCategoryMappingDocument } from "../../../generated/graphql";
import { TRPCError } from "@trpc/server";
import { CategoriesFetcher } from "./categories-fetcher";
import { createLogger } from "../../logger";

export const categoryMappingRouter = router({
  /**
   * Get all the category mappings to Google categories from its public metadata
   */
  getCategoryMappings: protectedClientProcedure.query(async ({ ctx: { apiClient } }) => {
    const logger = createLogger("categoryMappingRouter.getCategoryMappings");

    const categoriesFetcher = new CategoriesFetcher(apiClient);

    const result = await categoriesFetcher.fetchAllCategories().catch((e) => {
      logger.error("Can't fetch the categories", { error: e });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Can't fetch the categories",
      });
    });

    logger.debug("Returning categories", { first: result[0], totaLength: result.length });

    return result;
  }),
  /**
   * Sets the Google category mapping for a given category in its public metadata
   */
  setCategoryMapping: protectedClientProcedure
    .input(SetCategoryMappingInputSchema)
    .mutation(async ({ ctx: { apiClient }, input }) => {
      const logger = createLogger("categoryMappingRouter.setCategoryMapping", {
        categoryId: input.categoryId,
        googleCategoryId: input.googleCategoryId,
      });

      const { error } = await apiClient
        .mutation(UpdateCategoryMappingDocument, {
          id: input.categoryId,
          googleCategoryId: input.googleCategoryId || "",
        })
        .toPromise();

      logger.debug("Updated category mapping", {
        input,
      });

      if (error) {
        logger.error(`Error during the GraphqlAPI call: ${error.message}`);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't save the category",
        });
      }

      logger.info("Category mapping updated");
      return;
    }),
});
