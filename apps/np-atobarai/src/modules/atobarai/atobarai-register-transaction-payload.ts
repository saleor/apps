import { z } from "zod";

import { SaleorTransactionToken } from "../saleor/saleor-transaction-token";
import { AtobaraiCustomer, AtobaraiCustomerSchema } from "./atobarai-customer";
import {
  AtobaraiDeliveryDestination,
  AtobaraiDeliveryDestinationSchema,
} from "./atobarai-delivery-destination";
import { AtobaraiGoods, AtobaraiGoodsSchema } from "./atobarai-goods";
import { AtobaraiMoney } from "./atobarai-money";
import { ATOBARAI_SETTLEMENT_TYPE } from "./atobarai-settelment-type";
import { AtobaraiShopOrderDate } from "./atobarai-shop-order-date";

const schema = z
  .object({
    transactions: z.array(
      z.object({
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
  .brand("AtobaraiRegisterTransactionPayload");

export const createAtobaraiRegisterTransactionPayload = (args: {
  saleorTransactionToken: SaleorTransactionToken;
  atobaraiMoney: AtobaraiMoney;
  atobaraiCustomer: AtobaraiCustomer;
  atobaraiDeliveryDestination: AtobaraiDeliveryDestination;
  atobaraiGoods: AtobaraiGoods;
  atobaraiShopOrderDate: AtobaraiShopOrderDate;
}) =>
  schema.parse({
    transactions: [
      {
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

export type AtobaraiRegisterTransactionPayload = z.infer<typeof schema>;
