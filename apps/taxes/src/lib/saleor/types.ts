export type LineTaxResponsePayload = {
  total_gross_amount: number;
  total_net_amount: number;
  tax_rate: string;
};

export type ResponseTaxPayload = {
  shipping_price_gross_amount: number;
  shipping_price_net_amount: number;
  shipping_tax_rate: string;
  lines: LineTaxResponsePayload[];
};

export type FetchTaxesLinePayload = {
  id: string;
  quantity: number;
  taxCode?: string | null;
  discount: number;
  chargeTaxes: boolean;
  unitAmount: number;
  totalAmount: number;
};
