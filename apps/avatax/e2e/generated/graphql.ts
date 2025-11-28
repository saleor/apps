import * as Types from './types';

import { gql } from '../utils';
export type AddressFragmentFragment = { __typename?: 'Address', id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, cityArea: string, postalCode: string, countryArea: string };

export type CheckoutDetailsFragment = { __typename?: 'Checkout', id: string, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } };

export type CheckoutErrorFragment = { __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null };

export type MoneyFragment = { __typename?: 'Money', amount: number, currency: string };

export type OrderDetailsFragmentFragment = { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> };

export type DiscountsFragment = { __typename?: 'OrderDiscount', name?: string | null, reason?: string | null, type: Types.OrderDiscountType, valueType: Types.DiscountValueTypeEnum, value: any, amount: { __typename?: 'Money', amount: number } };

export type OrderErrorFragment = { __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null };

export type CheckoutAddBillingMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  billingAddress: Types.AddressInput;
}>;


export type CheckoutAddBillingMutation = { __typename?: 'Mutation', checkoutBillingAddressUpdate?: { __typename?: 'CheckoutBillingAddressUpdate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, shippingAddress?: { __typename?: 'Address', id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, cityArea: string, postalCode: string, countryArea: string } | null, billingAddress?: { __typename?: 'Address', id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, cityArea: string, postalCode: string, countryArea: string } | null, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CheckoutAddShippingMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  shippingAddress: Types.AddressInput;
}>;


export type CheckoutAddShippingMutation = { __typename?: 'Mutation', checkoutShippingAddressUpdate?: { __typename?: 'CheckoutShippingAddressUpdate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, shippingAddress?: { __typename?: 'Address', id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, cityArea: string, postalCode: string, countryArea: string } | null, billingAddress?: { __typename?: 'Address', id: string, firstName: string, lastName: string, streetAddress1: string, streetAddress2: string, city: string, cityArea: string, postalCode: string, countryArea: string } | null, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CheckoutAddVoucherMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  promoCode: Types.Scalars['String']['input'];
}>;


export type CheckoutAddVoucherMutation = { __typename?: 'Mutation', checkoutAddPromoCode?: { __typename?: 'CheckoutAddPromoCode', checkout?: { __typename?: 'Checkout', discountName?: string | null, id: string, discount?: { __typename?: 'Money', amount: number, currency: string } | null, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null, errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }> } | null };

export type CheckoutLinesUpdateMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  lines: Array<Types.CheckoutLineUpdateInput> | Types.CheckoutLineUpdateInput;
}>;


export type CheckoutLinesUpdateMutation = { __typename?: 'Mutation', checkoutLinesUpdate?: { __typename?: 'CheckoutLinesUpdate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CheckoutUpdateDeliveryMethodMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
  deliveryMethodId: Types.Scalars['ID']['input'];
}>;


export type CheckoutUpdateDeliveryMethodMutation = { __typename?: 'Mutation', checkoutDeliveryMethodUpdate?: { __typename?: 'CheckoutDeliveryMethodUpdate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CompleteCheckoutMutationVariables = Types.Exact<{
  checkoutId: Types.Scalars['ID']['input'];
}>;


export type CompleteCheckoutMutation = { __typename?: 'Mutation', checkoutComplete?: { __typename?: 'CheckoutComplete', confirmationNeeded: boolean, confirmationData?: any | null, order?: { __typename?: 'Order', id: string, metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null, errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }> } | null };

export type CreateCheckoutMutationVariables = Types.Exact<{
  channelSlug: Types.Scalars['String']['input'];
  email: Types.Scalars['String']['input'];
  address: Types.AddressInput;
  lines: Array<Types.CheckoutLineInput> | Types.CheckoutLineInput;
}>;


export type CreateCheckoutMutation = { __typename?: 'Mutation', checkoutCreate?: { __typename?: 'CheckoutCreate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CreateCheckoutNoAddressMutationVariables = Types.Exact<{
  channelSlug: Types.Scalars['String']['input'];
  lines: Array<Types.CheckoutLineInput> | Types.CheckoutLineInput;
  email: Types.Scalars['String']['input'];
}>;


export type CreateCheckoutNoAddressMutation = { __typename?: 'Mutation', checkoutCreate?: { __typename?: 'CheckoutCreate', errors: Array<{ __typename?: 'CheckoutError', message?: string | null, field?: string | null, code: Types.CheckoutErrorCode, addressType?: Types.AddressTypeEnum | null, variants?: Array<string> | null, lines?: Array<string> | null }>, checkout?: { __typename?: 'Checkout', id: string, lines: Array<{ __typename?: 'CheckoutLine', id: string, undiscountedTotalPrice: { __typename?: 'Money', amount: number, currency: string }, undiscountedUnitPrice: { __typename?: 'Money', amount: number, currency: string }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } }>, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } }, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string } } } | null } | null };

export type CreateDraftOrderMutationVariables = Types.Exact<{
  input: Types.DraftOrderCreateInput;
}>;


export type CreateDraftOrderMutation = { __typename?: 'Mutation', draftOrderCreate?: { __typename?: 'DraftOrderCreate', order?: { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type CreateOrderLinesMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  input: Array<Types.OrderLineCreateInput> | Types.OrderLineCreateInput;
}>;


export type CreateOrderLinesMutation = { __typename?: 'Mutation', orderLinesCreate?: { __typename?: 'OrderLinesCreate', order?: { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null, orderLines?: Array<{ __typename?: 'OrderLine', id: string, quantity: number }> | null } | null };

export type DraftOrderCompleteMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type DraftOrderCompleteMutation = { __typename?: 'Mutation', draftOrderComplete?: { __typename?: 'DraftOrderComplete', errors: Array<{ __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null }>, order?: { __typename?: 'Order', id: string, metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type OrderLineDeleteMutationVariables = Types.Exact<{
  lineId: Types.Scalars['ID']['input'];
}>;


export type OrderLineDeleteMutation = { __typename?: 'Mutation', orderLineDelete?: { __typename?: 'OrderLineDelete', order?: { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type DraftOrderUpdateAddressMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  billingAddress?: Types.InputMaybe<Types.AddressInput>;
  shippingAddress?: Types.InputMaybe<Types.AddressInput>;
  userEmail?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type DraftOrderUpdateAddressMutation = { __typename?: 'Mutation', draftOrderUpdate?: { __typename?: 'DraftOrderUpdate', errors: Array<{ __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null }>, order?: { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type DraftOrderUpdateShippingMethodMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  deliveryMethodId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type DraftOrderUpdateShippingMethodMutation = { __typename?: 'Mutation', orderUpdateShipping?: { __typename?: 'OrderUpdateShipping', errors: Array<{ __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null }>, order?: { __typename?: 'Order', id: string, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type DraftOrderUpdateVoucherMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  voucherCode?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type DraftOrderUpdateVoucherMutation = { __typename?: 'Mutation', draftOrderUpdate?: { __typename?: 'DraftOrderUpdate', errors: Array<{ __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null }>, order?: { __typename?: 'Order', voucherCode?: string | null, id: string, discounts: Array<{ __typename?: 'OrderDiscount', name?: string | null, reason?: string | null, type: Types.OrderDiscountType, valueType: Types.DiscountValueTypeEnum, value: any, amount: { __typename?: 'Money', amount: number } }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type OrderDiscountAddMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  input: Types.OrderDiscountCommonInput;
}>;


export type OrderDiscountAddMutation = { __typename?: 'Mutation', orderDiscountAdd?: { __typename?: 'OrderDiscountAdd', errors: Array<{ __typename?: 'OrderError', field?: string | null, message?: string | null, code: Types.OrderErrorCode, variants?: Array<string> | null, orderLines?: Array<string> | null, addressType?: Types.AddressTypeEnum | null, warehouse?: string | null }>, order?: { __typename?: 'Order', id: string, discounts: Array<{ __typename?: 'OrderDiscount', name?: string | null, reason?: string | null, type: Types.OrderDiscountType, valueType: Types.DiscountValueTypeEnum, value: any, amount: { __typename?: 'Money', amount: number } }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type OrderLineUpdateMutationVariables = Types.Exact<{
  lineId: Types.Scalars['ID']['input'];
  input: Types.OrderLineInput;
}>;


export type OrderLineUpdateMutation = { __typename?: 'Mutation', orderLineUpdate?: { __typename?: 'OrderLineUpdate', order?: { __typename?: 'Order', id: string, discounts: Array<{ __typename?: 'OrderDiscount', name?: string | null, reason?: string | null, type: Types.OrderDiscountType, valueType: Types.DiscountValueTypeEnum, value: any, amount: { __typename?: 'Money', amount: number } }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null } | null };

export type StaffUserTokenCreateMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
  password: Types.Scalars['String']['input'];
}>;


export type StaffUserTokenCreateMutation = { __typename?: 'Mutation', tokenCreate?: { __typename?: 'CreateToken', token?: string | null } | null };

export type UpdateMetadataMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput> | Types.MetadataInput;
}>;


export type UpdateMetadataMutation = { __typename?: 'Mutation', updateMetadata?: { __typename?: 'UpdateMetadata', errors: Array<{ __typename?: 'MetadataError', field?: string | null, message?: string | null }>, item?: { __typename?: 'Address' } | { __typename?: 'App' } | { __typename?: 'Attribute' } | { __typename?: 'Category' } | { __typename?: 'Channel' } | { __typename?: 'Checkout', id: string, metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine' } | { __typename?: 'Collection' } | { __typename?: 'DigitalContent' } | { __typename?: 'Fulfillment' } | { __typename?: 'GiftCard' } | { __typename?: 'Invoice' } | { __typename?: 'Menu' } | { __typename?: 'MenuItem' } | { __typename?: 'Order', id: string, metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine' } | { __typename?: 'Page' } | { __typename?: 'PageType' } | { __typename?: 'Payment' } | { __typename?: 'Product' } | { __typename?: 'ProductMedia' } | { __typename?: 'ProductType' } | { __typename?: 'ProductVariant' } | { __typename?: 'Promotion' } | { __typename?: 'Sale' } | { __typename?: 'ShippingMethod' } | { __typename?: 'ShippingMethodType' } | { __typename?: 'ShippingZone' } | { __typename?: 'Shop' } | { __typename?: 'TaxClass' } | { __typename?: 'TaxConfiguration' } | { __typename?: 'TransactionItem' } | { __typename?: 'User' } | { __typename?: 'Voucher' } | { __typename?: 'Warehouse' } | null } | null };

export type UpdatePrivateMetadataMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput> | Types.MetadataInput;
}>;


export type UpdatePrivateMetadataMutation = { __typename?: 'Mutation', updatePrivateMetadata?: { __typename?: 'UpdatePrivateMetadata', errors: Array<{ __typename?: 'MetadataError', field?: string | null, message?: string | null }>, item?: { __typename?: 'Address' } | { __typename?: 'App' } | { __typename?: 'Attribute' } | { __typename?: 'Category' } | { __typename?: 'Channel' } | { __typename?: 'Checkout', id: string, privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'CheckoutLine' } | { __typename?: 'Collection' } | { __typename?: 'DigitalContent' } | { __typename?: 'Fulfillment' } | { __typename?: 'GiftCard' } | { __typename?: 'Invoice' } | { __typename?: 'Menu' } | { __typename?: 'MenuItem' } | { __typename?: 'Order', id: string, privateMetadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }> } | { __typename?: 'OrderLine' } | { __typename?: 'Page' } | { __typename?: 'PageType' } | { __typename?: 'Payment' } | { __typename?: 'Product' } | { __typename?: 'ProductMedia' } | { __typename?: 'ProductType' } | { __typename?: 'ProductVariant' } | { __typename?: 'Promotion' } | { __typename?: 'Sale' } | { __typename?: 'ShippingMethod' } | { __typename?: 'ShippingMethodType' } | { __typename?: 'ShippingZone' } | { __typename?: 'Shop' } | { __typename?: 'TaxClass' } | { __typename?: 'TaxConfiguration' } | { __typename?: 'TransactionItem' } | { __typename?: 'User' } | { __typename?: 'Voucher' } | { __typename?: 'Warehouse' } | null } | null };

export type OrderDetailsQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type OrderDetailsQuery = { __typename?: 'Query', order?: { __typename?: 'Order', id: string, metadata: Array<{ __typename?: 'MetadataItem', key: string, value: string }>, total: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, shippingPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, undiscountedTotal: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } }, lines: Array<{ __typename?: 'OrderLine', id: string, quantity: number, totalPrice: { __typename?: 'TaxedMoney', gross: { __typename?: 'Money', amount: number, currency: string }, net: { __typename?: 'Money', amount: number, currency: string }, tax: { __typename?: 'Money', amount: number, currency: string } } }> } | null };

export const AddressFragment = gql`
    fragment AddressFragment on Address {
  id
  firstName
  lastName
  streetAddress1
  streetAddress2
  city
  cityArea
  postalCode
  countryArea
}
    `;
export const Money = gql`
    fragment Money on Money {
  amount
  currency
}
    `;
export const CheckoutDetails = gql`
    fragment CheckoutDetails on Checkout {
  id
  lines {
    id
    undiscountedTotalPrice {
      ...Money
    }
    undiscountedUnitPrice {
      ...Money
    }
    totalPrice {
      gross {
        ...Money
      }
      tax {
        ...Money
      }
      net {
        ...Money
      }
    }
  }
  shippingPrice {
    gross {
      ...Money
    }
    tax {
      ...Money
    }
    net {
      ...Money
    }
  }
  totalPrice {
    gross {
      ...Money
    }
    tax {
      ...Money
    }
    net {
      ...Money
    }
  }
}
    ${Money}`;
export const CheckoutError = gql`
    fragment CheckoutError on CheckoutError {
  message
  field
  code
  addressType
  variants
  lines
}
    `;
export const OrderDetailsFragment = gql`
    fragment OrderDetailsFragment on Order {
  id
  total {
    gross {
      ...Money
    }
    net {
      ...Money
    }
    tax {
      ...Money
    }
  }
  shippingPrice {
    gross {
      ...Money
    }
    net {
      ...Money
    }
    tax {
      ...Money
    }
  }
  undiscountedTotal {
    gross {
      ...Money
    }
    net {
      ...Money
    }
    tax {
      ...Money
    }
  }
  lines {
    id
    quantity
    totalPrice {
      gross {
        ...Money
      }
      net {
        ...Money
      }
      tax {
        ...Money
      }
    }
  }
}
    ${Money}`;
export const Discounts = gql`
    fragment Discounts on OrderDiscount {
  name
  reason
  type
  valueType
  value
  amount {
    amount
  }
}
    `;
export const OrderError = gql`
    fragment OrderError on OrderError {
  field
  message
  code
  variants
  orderLines
  addressType
  warehouse
}
    `;
export const CheckoutAddBilling = gql`
    mutation CheckoutAddBilling($id: ID!, $billingAddress: AddressInput!) {
  checkoutBillingAddressUpdate(id: $id, billingAddress: $billingAddress) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
      shippingAddress {
        ...AddressFragment
      }
      billingAddress {
        ...AddressFragment
      }
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}
${AddressFragment}`;
export const CheckoutAddShipping = gql`
    mutation CheckoutAddShipping($id: ID!, $shippingAddress: AddressInput!) {
  checkoutShippingAddressUpdate(id: $id, shippingAddress: $shippingAddress) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
      shippingAddress {
        ...AddressFragment
      }
      billingAddress {
        ...AddressFragment
      }
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}
${AddressFragment}`;
export const CheckoutAddVoucher = gql`
    mutation CheckoutAddVoucher($checkoutId: ID!, $promoCode: String!) {
  checkoutAddPromoCode(id: $checkoutId, promoCode: $promoCode) {
    checkout {
      ...CheckoutDetails
      discount {
        amount
        currency
      }
      discountName
    }
    errors {
      ...CheckoutError
    }
  }
}
    ${CheckoutDetails}
${CheckoutError}`;
export const CheckoutLinesUpdate = gql`
    mutation CheckoutLinesUpdate($checkoutId: ID!, $lines: [CheckoutLineUpdateInput!]!) {
  checkoutLinesUpdate(id: $checkoutId, lines: $lines) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}`;
export const CheckoutUpdateDeliveryMethod = gql`
    mutation CheckoutUpdateDeliveryMethod($checkoutId: ID!, $deliveryMethodId: ID!) {
  checkoutDeliveryMethodUpdate(
    id: $checkoutId
    deliveryMethodId: $deliveryMethodId
  ) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}`;
export const CompleteCheckout = gql`
    mutation CompleteCheckout($checkoutId: ID!) {
  checkoutComplete(id: $checkoutId) {
    order {
      ...OrderDetailsFragment
      metadata {
        key
        value
      }
    }
    confirmationNeeded
    confirmationData
    errors {
      ...CheckoutError
    }
  }
}
    ${OrderDetailsFragment}
${CheckoutError}`;
export const CreateCheckout = gql`
    mutation CreateCheckout($channelSlug: String!, $email: String!, $address: AddressInput!, $lines: [CheckoutLineInput!]!) {
  checkoutCreate(
    input: {channel: $channelSlug, lines: $lines, email: $email, shippingAddress: $address, billingAddress: $address, languageCode: EN_US}
  ) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}`;
export const CreateCheckoutNoAddress = gql`
    mutation CreateCheckoutNoAddress($channelSlug: String!, $lines: [CheckoutLineInput!]!, $email: String!) {
  checkoutCreate(
    input: {channel: $channelSlug, lines: $lines, email: $email, languageCode: EN_US}
  ) {
    errors {
      ...CheckoutError
    }
    checkout {
      ...CheckoutDetails
    }
  }
}
    ${CheckoutError}
${CheckoutDetails}`;
export const CreateDraftOrder = gql`
    mutation CreateDraftOrder($input: DraftOrderCreateInput!) {
  draftOrderCreate(input: $input) {
    order {
      id
      ...OrderDetailsFragment
    }
  }
}
    ${OrderDetailsFragment}`;
export const CreateOrderLines = gql`
    mutation CreateOrderLines($orderId: ID!, $input: [OrderLineCreateInput!]!) {
  orderLinesCreate(id: $orderId, input: $input) {
    order {
      ...OrderDetailsFragment
    }
    orderLines {
      id
      quantity
    }
  }
}
    ${OrderDetailsFragment}`;
export const DraftOrderComplete = gql`
    mutation DraftOrderComplete($id: ID!) {
  draftOrderComplete(id: $id) {
    errors {
      ...OrderError
    }
    order {
      ...OrderDetailsFragment
      metadata {
        key
        value
      }
    }
  }
}
    ${OrderError}
${OrderDetailsFragment}`;
export const OrderLineDelete = gql`
    mutation OrderLineDelete($lineId: ID!) {
  orderLineDelete(id: $lineId) {
    order {
      ...OrderDetailsFragment
    }
  }
}
    ${OrderDetailsFragment}`;
export const DraftOrderUpdateAddress = gql`
    mutation DraftOrderUpdateAddress($orderId: ID!, $billingAddress: AddressInput, $shippingAddress: AddressInput, $userEmail: String) {
  draftOrderUpdate(
    id: $orderId
    input: {billingAddress: $billingAddress, shippingAddress: $shippingAddress, userEmail: $userEmail}
  ) {
    errors {
      ...OrderError
    }
    order {
      ...OrderDetailsFragment
    }
  }
}
    ${OrderError}
${OrderDetailsFragment}`;
export const DraftOrderUpdateShippingMethod = gql`
    mutation DraftOrderUpdateShippingMethod($orderId: ID!, $deliveryMethodId: ID) {
  orderUpdateShipping(order: $orderId, input: {shippingMethod: $deliveryMethodId}) {
    errors {
      ...OrderError
    }
    order {
      ...OrderDetailsFragment
    }
  }
}
    ${OrderError}
${OrderDetailsFragment}`;
export const DraftOrderUpdateVoucher = gql`
    mutation DraftOrderUpdateVoucher($orderId: ID!, $voucherCode: String) {
  draftOrderUpdate(id: $orderId, input: {voucherCode: $voucherCode}) {
    errors {
      ...OrderError
    }
    order {
      ...OrderDetailsFragment
      voucherCode
      discounts {
        ...Discounts
      }
    }
  }
}
    ${OrderError}
${OrderDetailsFragment}
${Discounts}`;
export const OrderDiscountAdd = gql`
    mutation OrderDiscountAdd($orderId: ID!, $input: OrderDiscountCommonInput!) {
  orderDiscountAdd(orderId: $orderId, input: $input) {
    errors {
      ...OrderError
    }
    order {
      ...OrderDetailsFragment
      discounts {
        ...Discounts
      }
    }
  }
}
    ${OrderError}
${OrderDetailsFragment}
${Discounts}`;
export const OrderLineUpdate = gql`
    mutation OrderLineUpdate($lineId: ID!, $input: OrderLineInput!) {
  orderLineUpdate(id: $lineId, input: $input) {
    order {
      ...OrderDetailsFragment
      discounts {
        ...Discounts
      }
    }
  }
}
    ${OrderDetailsFragment}
${Discounts}`;
export const StaffUserTokenCreate = gql`
    mutation StaffUserTokenCreate($email: String!, $password: String!) {
  tokenCreate(email: $email, password: $password) {
    token
  }
}
    `;
export const UpdateMetadata = gql`
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    errors {
      field
      message
    }
    item {
      ... on Checkout {
        id
        metadata {
          key
          value
        }
      }
      ... on Order {
        id
        metadata {
          key
          value
        }
      }
    }
  }
}
    `;
export const UpdatePrivateMetadata = gql`
    mutation UpdatePrivateMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    errors {
      field
      message
    }
    item {
      ... on Checkout {
        id
        privateMetadata {
          key
          value
        }
      }
      ... on Order {
        id
        privateMetadata {
          key
          value
        }
      }
    }
  }
}
    `;
export const OrderDetails = gql`
    query OrderDetails($id: ID!) {
  order(id: $id) {
    ...OrderDetailsFragment
    metadata {
      key
      value
    }
  }
}
    ${OrderDetailsFragment}`;