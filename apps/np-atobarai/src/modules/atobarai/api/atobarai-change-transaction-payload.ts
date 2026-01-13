import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";
import { SaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";

import { AtobaraiCustomer, AtobaraiCustomerSchema } from "../atobarai-customer";
import {
  AtobaraiDeliveryDestination,
  AtobaraiDeliveryDestinationSchema,
} from "../atobarai-delivery-destination";
import { AtobaraiGoods, AtobaraiGoodsSchema } from "../atobarai-goods/atobarai-goods";
import { AtobaraiMoney } from "../atobarai-money";
import { ATOBARAI_SETTLEMENT_TYPE } from "../atobarai-settelment-type";
import { AtobaraiShopOrderDate } from "../atobarai-shop-order-date";
import { AtobaraiTransactionId, AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z
  .object({
    transactions: z.array(
      z.object({
        np_transaction_id: AtobaraiTransactionIdSchema,
        shop_transaction_id: z.string().max(40),
        shop_order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        }),
        settlement_type: z.literal(ATOBARAI_SETTLEMENT_TYPE),
        billed_amount: z.number().positive(),
        customer: AtobaraiCustomerSchema,
        dest_customer: AtobaraiDeliveryDestinationSchema,
        goods: AtobaraiGoodsSchema,
      }),
    ),
  })
  .brand("AtobaraiChangeTransactionPayload");

export const AtobaraiChangeTransactionPayloadValidationError = BaseError.subclass(
  "AtobaraiChangeTransactionPayloadValidationError",
  {
    props: {
      _brand: "AtobaraiChangeTransactionPayloadValidationError" as const,
    },
  },
);

export const createAtobaraiChangeTransactionPayload = (args: {
  atobaraiTransactionId: AtobaraiTransactionId;
  saleorTransactionToken: SaleorTransactionToken;
  atobaraiMoney: AtobaraiMoney;
  atobaraiCustomer: AtobaraiCustomer;
  atobaraiDeliveryDestination: AtobaraiDeliveryDestination;
  atobaraiGoods: AtobaraiGoods;
  atobaraiShopOrderDate: AtobaraiShopOrderDate;
}): AtobaraiChangeTransactionPayload => {
  const parseResult = schema.safeParse({
    transactions: [
      {
        np_transaction_id: args.atobaraiTransactionId,
        shop_transaction_id: args.saleorTransactionToken,
        shop_order_date: args.atobaraiShopOrderDate,
        settlement_type: ATOBARAI_SETTLEMENT_TYPE,
        billed_amount: args.atobaraiMoney.amount,
        customer: args.atobaraiCustomer,
        dest_customer: args.atobaraiDeliveryDestination,
        goods: args.atobaraiGoods,
      },
    ],
  });

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiChangeTransactionPayloadValidationError(
      `Invalid change transaction payload: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiChangeTransactionPayload = z.infer<typeof schema>;
