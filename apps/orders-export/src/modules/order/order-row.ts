export interface OrderRowLine {
  productVariantId: string;
  productSku: string;
  variantName: string;
  quantity: number;
  unitPriceGrossAmount: number;
  unitPriceNetAmount: number;
}

// todo add more fields
export interface OrderRowFull extends OrderRowLine {
  id: string;
  number: string;
  userId: string;
  userEmail: string;
  channelId: string;
  channelSlug: string;
  shippingMethodName: string;
  totalGrossAmount: string;
  totalNetAmount: string;
  orderCurrency: string;
}
