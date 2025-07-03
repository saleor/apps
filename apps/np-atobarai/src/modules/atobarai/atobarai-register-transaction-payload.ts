import { z } from "zod";

import { SaleorTransactionId } from "../saleor/saleor-transaction-id";
import { AtobaraiCustomer } from "./atobarai-customer";
import { AtobaraiGoods } from "./atobarai-goods";
import { AtobaraiMoney } from "./atobarai-money";
import { ATOBARAI_SETTLEMENT_TYPE } from "./atobarai-settelment-type";
import { AtobaraiDeliveryDestination } from "./atobarai-shipping-address";

const schema = z
  .object({
    transactions: z.array(
      z.object({
        // TODO: check if saleorTransactionId is more than 40 characters
        shop_transaction_id: z.string().max(40),
        shop_order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        }),
        settlement_type: z.literal(ATOBARAI_SETTLEMENT_TYPE),
        billed_amount: z.number().max(6),
        customer: AtobaraiCustomer.schema,
        dest_customer: AtobaraiDeliveryDestination.schema,
        goods: AtobaraiGoods.schema,
      }),
    ),
  })
  .brand("AtobaraiRegisterTransactionPayload");

export const createAtobaraiRegisterTransactionPayload = (args: {
  saleorTransactionId: SaleorTransactionId;
  atobaraiMoney: AtobaraiMoney;
  atobaraiCustomer: AtobaraiCustomer;
  atobaraiDeliveryDestination: AtobaraiDeliveryDestination;
  goods: AtobaraiGoods;
  saleorEventDate: string;
}) =>
  schema.parse({
    transactions: [
      {
        shop_transaction_id: args.saleorTransactionId,
        shop_order_date: args.saleorEventDate,
        settlement_type: ATOBARAI_SETTLEMENT_TYPE,
        billed_amount: args.atobaraiMoney.amount,
        customer: args.atobaraiCustomer.getCustomerAddress(),
        dest_customer: args.atobaraiDeliveryDestination.getDeliveryDestination(),
        goods: args.goods.getGoods(),
      },
    ],
  });

export type AtobaraiRegisterTransactionPayload = z.infer<typeof schema>;
