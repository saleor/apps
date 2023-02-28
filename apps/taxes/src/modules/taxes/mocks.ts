import { ResponseTaxPayload } from "../../lib/saleor/types";

export const MOCKED_RESPONSE_TAX_PAYLOAD: ResponseTaxPayload = {
  lines: [
    {
      tax_rate: "10",
      total_gross_amount: 4,
      total_net_amount: 3,
    },
    {
      tax_rate: "10",
      total_gross_amount: 20,
      total_net_amount: 5,
    },
  ],
  shipping_price_gross_amount: 0,
  shipping_price_net_amount: 0,
  shipping_tax_rate: "10",
};
