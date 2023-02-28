import { ResponseTaxPayload } from "../../lib/saleor/types";

export const defaultTaxesResponse: ResponseTaxPayload = {
  lines: [],
  shipping_price_gross_amount: 0,
  shipping_price_net_amount: 0,
  shipping_tax_rate: "0",
};
