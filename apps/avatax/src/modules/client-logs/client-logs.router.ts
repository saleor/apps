import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { err, ok } from "neverthrow";
import { z } from "zod";

import { createLogger } from "@/logger";
import { type ClientLogValue } from "@/modules/client-logs/client-log";
import { clientLogsFeatureConfig } from "@/modules/client-logs/client-logs-feature-config";
import {
  createLogsDocumentClient,
  createLogsDynamoClient,
} from "@/modules/client-logs/dynamo-client";
import { LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

import { ClientLogDynamoEntityFactory, LogsTable } from "./dynamo-schema";

// TODO: Remove this lazy method once feature is not behind feature flag
const getLogsRepository = () => {
  const logger = createLogger("getLogsRepository");

  if (!clientLogsFeatureConfig.dynamoTableName) {
    logger.warn("DYNAMODB_LOGS_TABLE_NAME is not set.");

    return err(new Error("DYNAMODB_LOGS_TABLE_NAME is not set."));
  }

  const logsTable = LogsTable.create({
    documentClient: createLogsDocumentClient(createLogsDynamoClient()),
    tableName: clientLogsFeatureConfig.dynamoTableName,
  });
  const logByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);
  const logByCheckoutOrOrderId =
    ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);

  return ok(
    new LogsRepositoryDynamodb({
      logsTable,
      logByDateEntity,
      logByCheckoutOrOrderId: logByCheckoutOrOrderId,
    }),
  );
};

const procedureWithFlag = protectedClientProcedure.use(({ ctx, next }) => {
  if (!clientLogsFeatureConfig.isEnabled) {
    throw new TRPCError({
      cause: "Feature disabled",
      code: "FORBIDDEN",
      message: "Feature is disabled",
    });
  }

  const logsRepositoryResult = getLogsRepository();

  if (logsRepositoryResult.isErr()) {
    Sentry.captureException(logsRepositoryResult.error);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Logs unavailable, contact support",
    });
  }

  return next({
    ctx: {
      ...ctx,
      logsRepository: logsRepositoryResult.value,
    },
  });
});

/**
 * TODO: Implement pagination
 *
 * Router that fetches logs in the frontend.
 * To write log, use directly repository
 */
export const clientLogsRouter = router({
  isEnabled: protectedClientProcedure.query(({ ctx }) => {
    return clientLogsFeatureConfig.isEnabled;
  }),
  getByDate: procedureWithFlag
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }),
    )
    .query(async ({ input, ctx }): Promise<ClientLogValue[]> => {
      const logsResult = await ctx.logsRepository.getLogsByDate({
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        appId: ctx.appId,
        saleorApiUrl: ctx.saleorApiUrl,
      });

      if (logsResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch logs",
        });
      }

      return logsResult.value.map((l) => l.getValue());
    }),
  getByCheckoutOrOrderId: procedureWithFlag
    .input(
      z.object({
        checkoutOrOrderId: z.string(),
      }),
    )
    .query(async ({ input, ctx }): Promise<ClientLogValue[]> => {
      const logsResult = await ctx.logsRepository.getLogsByCheckoutOrOrderId({
        checkoutOrOrderId: input.checkoutOrOrderId,
        appId: ctx.appId,
        saleorApiUrl: ctx.saleorApiUrl,
      });

      if (logsResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch logs",
        });
      }

      return logsResult.value.map((l) => l.getValue());
    }),
});
