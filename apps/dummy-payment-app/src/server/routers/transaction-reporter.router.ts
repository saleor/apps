import { TRPCError } from "@trpc/server";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { getTransactionActions } from "@/lib/transaction-actions";
import { createLogger } from "@/logger";
import {
  DEFAULT_EVENT_MESSAGE,
  DEFAULT_TRANSACTION_MESSAGE,
  DEFAULT_TRANSACTION_NAME,
} from "@/modules/transaction/transaction-defaults";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";
import { paymentMethodDetailsSchema } from "@/modules/validation/transaction-create";

import {
  TransactionActionEnum,
  TransactionCreateDocument,
  TransactionEventReportDocument,
  TransactionEventTypeEnum,
} from "../../../generated/graphql";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";
import { router } from "../server";

export const transactionReporterRouter = router({
  reportEvent: procedureWithGraphqlClient
    .input(
      z.object({
        id: z.string(),
        amount: z.number().nonnegative().finite().nullable(),
        type: z.nativeEnum(TransactionEventTypeEnum),
        pspReference: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, amount, type, pspReference, message } = input;
      const logger = createLogger("transactionReporterRouter.reportEvent", { input });

      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const result = await ctx.apiClient.mutation(TransactionEventReportDocument, {
        id,
        amount,
        type,
        pspReference: pspReference ?? uuidv7(),
        message: message ?? "Great success!",
        availableActions: getTransactionActions(type) as TransactionActionEnum[],
        externalUrl: urlGenerator.getTransactionDetailsUrl(id),
      });

      logger.info("Received result from Saleor", { hasError: Boolean(result.error) });

      if (result.error) {
        logger.error("There was an error while making mutation call", { error: result.error });
        throw new TRPCError({
          message: result.error.message,
          cause: result.error,
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const errors = result.data?.transactionEventReport?.errors;

      if (errors && errors.length > 0) {
        logger.error("Error in mutation result", { errorsCount: errors.length });
        throw new TRPCError({
          message: errors.map((error) => error.message).join(", "),
          cause: errors[0],
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const data = result.data?.transactionEventReport;

      if (!data) {
        logger.error("Missing data in response", { data: result.data });
        throw new TRPCError({
          message: "Saleor didn't return response from transactionEventReport mutation",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        alreadyProcessed: data.alreadyProcessed,
        transactionEvent: data.transactionEvent,
      };
    }),

  /**
   * Creates a transaction on an order (bare shell) and optionally reports a single
   * typed event in the same server round-trip. Used by both the precise "create"
   * form (no initial event) and the quick-actions (create + charge/authorize).
   */
  createTransaction: procedureWithGraphqlClient
    .input(
      z.object({
        orderId: z.string(),
        name: z.string().optional(),
        message: z.string().optional(),
        pspReference: z.string().optional(),
        availableActions: z.array(z.nativeEnum(TransactionActionEnum)).optional(),
        paymentMethodDetails: paymentMethodDetailsSchema.optional(),
        initialEvent: z
          .object({
            type: z.nativeEnum(TransactionEventTypeEnum),
            amount: z.number().nonnegative().finite().nullable(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("transactionReporterRouter.createTransaction", { input });
      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const pspReference = input.pspReference ?? uuidv7();

      const createResult = await ctx.apiClient.mutation(TransactionCreateDocument, {
        id: input.orderId,
        name: input.name ?? DEFAULT_TRANSACTION_NAME,
        message: input.message ?? DEFAULT_TRANSACTION_MESSAGE,
        pspReference,
        availableActions: input.availableActions,
        paymentMethodDetails: input.paymentMethodDetails,
      });

      logger.info("Received transactionCreate result from Saleor", { result: createResult });

      if (createResult.error) {
        logger.error("There was an error while creating transaction", {
          error: createResult.error,
        });
        throw new TRPCError({
          message: createResult.error.message,
          cause: createResult.error,
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const createErrors = createResult.data?.transactionCreate?.errors;

      if (createErrors && createErrors.length > 0) {
        logger.error("Error in transactionCreate result", { errors: createErrors });
        throw new TRPCError({
          message: createErrors.map((error) => error.message).join(", "),
          cause: createErrors[0],
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const transaction = createResult.data?.transactionCreate?.transaction;

      if (!transaction) {
        logger.error("Missing transaction in response", { data: createResult.data });
        throw new TRPCError({
          message: "Saleor didn't return a transaction from transactionCreate mutation",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      if (!input.initialEvent) {
        return { transactionId: transaction.id, pspReference: transaction.pspReference };
      }

      const { type, amount } = input.initialEvent;

      const eventResult = await ctx.apiClient.mutation(TransactionEventReportDocument, {
        id: transaction.id,
        amount,
        type,
        pspReference: transaction.pspReference ?? pspReference,
        message: DEFAULT_EVENT_MESSAGE,
        availableActions: getTransactionActions(type) as TransactionActionEnum[],
        externalUrl: urlGenerator.getTransactionDetailsUrl(transaction.id),
      });

      logger.info("Received transactionEventReport result from Saleor", { result: eventResult });

      if (eventResult.error) {
        logger.error("There was an error while reporting initial event", {
          error: eventResult.error,
        });
        throw new TRPCError({
          message: eventResult.error.message,
          cause: eventResult.error,
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const eventErrors = eventResult.data?.transactionEventReport?.errors;

      if (eventErrors && eventErrors.length > 0) {
        logger.error("Error in transactionEventReport result", { errors: eventErrors });
        throw new TRPCError({
          message: eventErrors.map((error) => error.message).join(", "),
          cause: eventErrors[0],
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return { transactionId: transaction.id, pspReference: transaction.pspReference };
    }),
});
