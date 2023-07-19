import { z } from "zod";

import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";

import { DatoCMSClient } from "./datocms-client";
import { TRPCError } from "@trpc/server";

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
      })
    )
    .mutation(({ ctx, input }) => {
      const client = new DatoCMSClient({
        apiToken: input.apiToken,
      });

      return client.getContentTypes().catch((err) => {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      });
    }),

  fetchContentTypeFields: protectedClientProcedure
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

      return client
        .getFieldsForContentType({
          itemTypeID: input.contentTypeID,
        })
        .catch((err) => {
          throw new TRPCError({
            code: "BAD_REQUEST",
          });
        });
    }),
});
