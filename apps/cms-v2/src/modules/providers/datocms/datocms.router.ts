import { z } from "zod";

import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";

import { DatoCMSClient } from "./datocms-client";
import { TRPCError } from "@trpc/server";
import { createLogger } from "../../../logger";

/**
 * Operations specific for Datocms service.
 *
 * For configruration see providers-list.router.ts
 */
export const datocmsRouter = router({
  fetchContentTypes: protectedClientProcedure
    .input(
      z.object({
        apiToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const logger = createLogger("datocmsRouter.fetchContentTypes");

      logger.debug("Calling fetch content types");

      const client = new DatoCMSClient({
        apiToken: input.apiToken,
      });

      try {
        const contentTypes = await client.getContentTypes();

        logger.debug("Content types fetched successfully", {
          contentTypes: contentTypes.map((c) => c.name),
        });

        return contentTypes;
      } catch (e) {
        logger.warn("Can't fetch content types", { error: e });

        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    }),

  fetchContentTypeFields: protectedClientProcedure
    .input(
      z.object({
        contentTypeID: z.string(),
        apiToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const logger = createLogger("datocmsRouter.fetchContentTypeFields", {
        contentTypeID: input.contentTypeID,
      });

      logger.debug("Calling fetch content type fields");

      const client = new DatoCMSClient({
        apiToken: input.apiToken,
      });

      try {
        const fields = await client.getFieldsForContentType({
          itemTypeID: input.contentTypeID,
        });

        logger.debug("Content type fields fetched successfully", {
          contentTypesIds: fields.map((f) => f.id),
        });
        return fields;
      } catch (e) {
        logger.warn("Can't fetch content type fields", { error: e });

        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    }),
});
