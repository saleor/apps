import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";
import { type ClientLogValue } from "@/modules/client-logs/client-log";
import { LastEvaluatedKey, LogsRepositoryDynamodb } from "@/modules/client-logs/logs-repository";
import { createDocumentClient, createDynamoClient } from "@/modules/dynamodb/dynamo-client";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

import { ClientLogDynamoEntityFactory, LogsTable } from "./dynamo-logs-table";

const procedureWithLogsRepository = protectedClientProcedure.use(({ ctx, next }) => {
  try {
    const logsTable = LogsTable.create({
      documentClient: createDocumentClient(
        createDynamoClient({
          connectionTimeout: env.DYNAMODB_CONNECTION_TIMEOUT_MS,
          requestTimeout: env.DYNAMODB_REQUEST_TIMEOUT_MS,
        }),
      ),
      tableName: env.DYNAMODB_LOGS_TABLE_NAME,
    });
    const logByDateEntity = ClientLogDynamoEntityFactory.createLogByDate(logsTable);
    const logByCheckoutOrOrderId =
      ClientLogDynamoEntityFactory.createLogByCheckoutOrOrderId(logsTable);

    return next({
      ctx: {
        ...ctx,
        logsRepository: new LogsRepositoryDynamodb({
          logsTable,
          logByDateEntity,
          logByCheckoutOrOrderId,
        }),
      },
    });
  } catch (e) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Logs are not available, contact Saleor support",
    });
  }
});

/**
 *
 * Router that fetches logs in the frontend.
 * To write log, use directly repository
 */
export const clientLogsRouter = router({
  getByDate: procedureWithLogsRepository
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        lastEvaluatedKey: z.record(z.unknown()).optional(),
      }),
    )
    .query(
      async ({
        input,
        ctx,
      }): Promise<{ clientLogs: ClientLogValue[]; lastEvaluatedKey: LastEvaluatedKey }> => {
        const logsResult = await ctx.logsRepository.getLogsByDate({
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          appId: ctx.appId,
          saleorApiUrl: ctx.saleorApiUrl,
          lastEvaluatedKey: input.lastEvaluatedKey,
        });

        if (logsResult.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch logs",
          });
        }

        return {
          clientLogs: logsResult.value.clientLogs.map((l) => l.getValue()),
          lastEvaluatedKey: logsResult.value.lastEvaluatedKey,
        };
      },
    ),
  getByCheckoutOrOrderId: procedureWithLogsRepository
    .input(
      z.object({
        checkoutOrOrderId: z.string(),
        lastEvaluatedKey: z.record(z.unknown()).optional(),
      }),
    )
    .query(
      async ({
        input,
        ctx,
      }): Promise<{ clientLogs: ClientLogValue[]; lastEvaluatedKey: LastEvaluatedKey }> => {
        const logsResult = await ctx.logsRepository.getLogsByCheckoutOrOrderId({
          checkoutOrOrderId: input.checkoutOrOrderId,
          appId: ctx.appId,
          saleorApiUrl: ctx.saleorApiUrl,
          lastEvaluatedKey: input.lastEvaluatedKey,
        });

        if (logsResult.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch logs",
          });
        }

        return {
          clientLogs: logsResult.value.clientLogs.map((l) => l.getValue()),
          lastEvaluatedKey: logsResult.value.lastEvaluatedKey,
        };
      },
    ),
});
