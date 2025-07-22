import { z } from "zod";

import { SaleorTransactionToken } from "@/modules/saleor/saleor-transaction-token";

import { AtobaraiGoods, AtobaraiGoodsSchema } from "../atobarai-goods";
import { AtobaraiMoney } from "../atobarai-money";
import { AtobaraiShopOrderDate } from "../atobarai-shop-order-date";
import { AtobaraiTransactionId, AtobaraiTransactionIdSchema } from "../atobarai-transaction-id";

const schema = z.object({
  transactions: z.array(
    z.object({
      base_np_transaction_id: AtobaraiTransactionIdSchema,
      shop_transaction_id: z.string(),
      shop_order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format",
      }),
      billed_amount: z.number().positive(),
      goods: AtobaraiGoodsSchema,
    }),
  ),
});

export const createAtobaraiReregisterTransactionPayload = (args: {
  transactionId: AtobaraiTransactionId;
  saleorTransactionToken: SaleorTransactionToken;
  goods: AtobaraiGoods;
  shopOrderDate: AtobaraiShopOrderDate;
  atobaraiMoney: AtobaraiMoney;
}) =>
  schema.parse({
    transactions: [
      {
        base_np_transaction_id: args.transactionId,
        shop_transaction_id: args.saleorTransactionToken,
        shop_order_date: args.shopOrderDate,
        billed_amount: args.atobaraiMoney.amount,
        goods: args.goods,
      },
    ],
  });

export type AtobaraiReregisterTransactionPayload = z.infer<typeof schema>;
