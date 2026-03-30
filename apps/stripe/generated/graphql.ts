import gql from 'graphql-tag';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: string; output: string; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: string; output: string; }
  /** The `Day` scalar type represents number of days by integer value. */
  Day: { input: string; output: string; }
  /**
   * Custom Decimal implementation.
   *
   * Returns Decimal as a float in the API,
   * parses float to the Decimal on the way back.
   */
  Decimal: { input: number; output: number; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: JSONValue; output: JSONValue; }
  /** The `Hour` scalar type represents number of hours by integer value. */
  Hour: { input: number; output: number; }
  JSON: { input: JSONValue; output: JSONValue; }
  JSONString: { input: string; output: string; }
  /**
   * Metadata is a map of key-value pairs, both keys and values are `String`.
   *
   * Example:
   * ```
   * {
   *     "key1": "value1",
   *     "key2": "value2"
   * }
   * ```
   */
  Metadata: { input: Record<string, string>; output: Record<string, string>; }
  /** The `Minute` scalar type represents number of minutes by integer value. */
  Minute: { input: number; output: number; }
  /**
   * Nonnegative Decimal scalar implementation.
   *
   * Should be used in places where value must be nonnegative (0 or greater).
   */
  PositiveDecimal: { input: number; output: number; }
  /**
   * Positive Integer scalar implementation.
   *
   * Should be used in places where value must be positive (greater than 0).
   */
  PositiveInt: { input: number; output: number; }
  UUID: { input: string; output: string; }
  /** Variables of this type must be set to null in mutations. They will be replaced with a filename from a following multipart part containing a binary file. See: https://github.com/jaydenseric/graphql-multipart-request-spec. */
  Upload: { input: unknown; output: unknown; }
  WeightScalar: { input: number; output: number; }
  /** _Any value scalar as defined by Federation spec. */
  _Any: { input: unknown; output: unknown; }
};

export type CardPaymentMethodDetailsInput = {
  /** Brand of the payment method used for the transaction. Max length is 40 characters. */
  readonly brand?: InputMaybe<Scalars['String']['input']>;
  /** Expiration month of the card used for the transaction. Value must be between 1 and 12. */
  readonly expMonth?: InputMaybe<Scalars['Int']['input']>;
  /** Expiration year of the card used for the transaction. Value must be between 2000 and 9999. */
  readonly expYear?: InputMaybe<Scalars['Int']['input']>;
  /** First digits of the card used for the transaction. Max length is 4 characters. */
  readonly firstDigits?: InputMaybe<Scalars['String']['input']>;
  /** Last digits of the card used for the transaction. Max length is 4 characters. */
  readonly lastDigits?: InputMaybe<Scalars['String']['input']>;
  /** Name of the payment method used for the transaction. Max length is 256 characters. */
  readonly name: Scalars['String']['input'];
};

export type OtherPaymentMethodDetailsInput = {
  /** Name of the payment method used for the transaction. */
  readonly name: Scalars['String']['input'];
};

/**
 * Details of the payment method used for the transaction. One of `card` or `other` is required.
 *
 * Added in Saleor 3.22.
 */
export type PaymentMethodDetailsInput = {
  /** Details of the card payment method used for the transaction. */
  readonly card?: InputMaybe<CardPaymentMethodDetailsInput>;
  /** Details of the non-card payment method used for this transaction. */
  readonly other?: InputMaybe<OtherPaymentMethodDetailsInput>;
};

/**
 * Represents possible actions on payment transaction.
 *
 *     The following actions are possible:
 *     CHARGE - Represents the charge action.
 *     REFUND - Represents a refund action.
 *     CANCEL - Represents a cancel action. Added in Saleor 3.12.
 */
export type TransactionActionEnum =
  | 'CANCEL'
  | 'CHARGE'
  | 'REFUND';

export type TransactionEventReportErrorCode =
  | 'ALREADY_EXISTS'
  | 'GRAPHQL_ERROR'
  | 'INCORRECT_DETAILS'
  | 'INVALID'
  | 'NOT_FOUND'
  | 'REQUIRED';

/**
 * Represents possible event types.
 *
 *     Added in Saleor 3.12.
 *
 *     The following types are possible:
 *     AUTHORIZATION_SUCCESS - represents success authorization.
 *     AUTHORIZATION_FAILURE - represents failure authorization.
 *     AUTHORIZATION_ADJUSTMENT - represents authorization adjustment.
 *     AUTHORIZATION_REQUEST - represents authorization request.
 *     AUTHORIZATION_ACTION_REQUIRED - represents authorization that needs
 *     additional actions from the customer.
 *     CHARGE_ACTION_REQUIRED - represents charge that needs
 *     additional actions from the customer.
 *     CHARGE_SUCCESS - represents success charge.
 *     CHARGE_FAILURE - represents failure charge.
 *     CHARGE_BACK - represents chargeback.
 *     CHARGE_REQUEST - represents charge request.
 *     REFUND_SUCCESS - represents success refund.
 *     REFUND_FAILURE - represents failure refund.
 *     REFUND_REVERSE - represents reverse refund.
 *     REFUND_REQUEST - represents refund request.
 *     CANCEL_SUCCESS - represents success cancel.
 *     CANCEL_FAILURE - represents failure cancel.
 *     CANCEL_REQUEST - represents cancel request.
 *     INFO - represents info event.
 */
export type TransactionEventTypeEnum =
  | 'AUTHORIZATION_ACTION_REQUIRED'
  | 'AUTHORIZATION_ADJUSTMENT'
  | 'AUTHORIZATION_FAILURE'
  | 'AUTHORIZATION_REQUEST'
  | 'AUTHORIZATION_SUCCESS'
  | 'CANCEL_FAILURE'
  | 'CANCEL_REQUEST'
  | 'CANCEL_SUCCESS'
  | 'CHARGE_ACTION_REQUIRED'
  | 'CHARGE_BACK'
  | 'CHARGE_FAILURE'
  | 'CHARGE_REQUEST'
  | 'CHARGE_SUCCESS'
  | 'INFO'
  | 'REFUND_FAILURE'
  | 'REFUND_REQUEST'
  | 'REFUND_REVERSE'
  | 'REFUND_SUCCESS';

/**
 * Determine the transaction flow strategy.
 *
 *     AUTHORIZATION - the processed transaction should be only authorized
 *     CHARGE - the processed transaction should be charged.
 */
export type TransactionFlowStrategyEnum =
  | 'AUTHORIZATION'
  | 'CHARGE';

export type ChannelFragment = { readonly id: string, readonly slug: string };

type EventMetadata_AccountChangeEmailRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountConfirmationRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountConfirmed_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountDeleteRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountEmailChanged_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AccountSetPasswordRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AddressCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AddressDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AddressUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AppDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AppInstalled_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AppStatusChanged_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AppUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeValueCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeValueDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_AttributeValueUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CalculateTaxes_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CategoryCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CategoryDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CategoryUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ChannelCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ChannelDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ChannelMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ChannelStatusChanged_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ChannelUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutFilterShippingMethods_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutFullyAuthorized_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutFullyPaid_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CheckoutUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CollectionCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CollectionDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CollectionMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CollectionUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CustomerCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CustomerMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_CustomerUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_DraftOrderCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_DraftOrderDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_DraftOrderUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_FulfillmentApproved_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_FulfillmentCanceled_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_FulfillmentCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_FulfillmentMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_FulfillmentTrackingNumberUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardExportCompleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardSent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardStatusChanged_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_GiftCardUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_InvoiceDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_InvoiceRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_InvoiceSent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ListStoredPaymentMethods_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuItemCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuItemDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuItemUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_MenuUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderBulkCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderCancelled_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderConfirmed_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderExpired_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderFilterShippingMethods_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderFulfilled_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderFullyPaid_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderFullyRefunded_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderPaid_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderRefunded_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_OrderUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageTypeCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageTypeDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageTypeUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PageUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentAuthorize_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentCaptureEvent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentConfirmEvent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentGatewayInitializeSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentGatewayInitializeTokenizationSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentListGateways_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentMethodInitializeTokenizationSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentMethodProcessTokenizationSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentProcessEvent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentRefundEvent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PaymentVoidEvent_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PermissionGroupCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PermissionGroupDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PermissionGroupUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductExportCompleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductMediaCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductMediaDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductMediaUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantBackInStock_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantDiscountedPriceUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantOutOfStock_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantStockUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ProductVariantUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionEnded_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionRuleCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionRuleDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionRuleUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionStarted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_PromotionUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_SaleCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_SaleDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_SaleToggle_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_SaleUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingListMethodsForCheckout_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingPriceCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingPriceDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingPriceUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingZoneCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingZoneDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingZoneMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShippingZoneUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ShopMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_StaffCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_StaffDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_StaffSetPasswordRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_StaffUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_StoredPaymentMethodDeleteRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_ThumbnailCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionCancelationRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionChargeRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionInitializeSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionItemMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionProcessSession_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TransactionRefundRequested_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TranslationCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_TranslationUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherCodeExportCompleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherCodesCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherCodesDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_VoucherUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_WarehouseCreated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_WarehouseDeleted_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_WarehouseMetadataUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

type EventMetadata_WarehouseUpdated_Fragment = { readonly version?: string | null, readonly recipient?: { readonly id: string } | null };

export type EventMetadataFragment = EventMetadata_AccountChangeEmailRequested_Fragment | EventMetadata_AccountConfirmationRequested_Fragment | EventMetadata_AccountConfirmed_Fragment | EventMetadata_AccountDeleteRequested_Fragment | EventMetadata_AccountDeleted_Fragment | EventMetadata_AccountEmailChanged_Fragment | EventMetadata_AccountSetPasswordRequested_Fragment | EventMetadata_AddressCreated_Fragment | EventMetadata_AddressDeleted_Fragment | EventMetadata_AddressUpdated_Fragment | EventMetadata_AppDeleted_Fragment | EventMetadata_AppInstalled_Fragment | EventMetadata_AppStatusChanged_Fragment | EventMetadata_AppUpdated_Fragment | EventMetadata_AttributeCreated_Fragment | EventMetadata_AttributeDeleted_Fragment | EventMetadata_AttributeUpdated_Fragment | EventMetadata_AttributeValueCreated_Fragment | EventMetadata_AttributeValueDeleted_Fragment | EventMetadata_AttributeValueUpdated_Fragment | EventMetadata_CalculateTaxes_Fragment | EventMetadata_CategoryCreated_Fragment | EventMetadata_CategoryDeleted_Fragment | EventMetadata_CategoryUpdated_Fragment | EventMetadata_ChannelCreated_Fragment | EventMetadata_ChannelDeleted_Fragment | EventMetadata_ChannelMetadataUpdated_Fragment | EventMetadata_ChannelStatusChanged_Fragment | EventMetadata_ChannelUpdated_Fragment | EventMetadata_CheckoutCreated_Fragment | EventMetadata_CheckoutFilterShippingMethods_Fragment | EventMetadata_CheckoutFullyAuthorized_Fragment | EventMetadata_CheckoutFullyPaid_Fragment | EventMetadata_CheckoutMetadataUpdated_Fragment | EventMetadata_CheckoutUpdated_Fragment | EventMetadata_CollectionCreated_Fragment | EventMetadata_CollectionDeleted_Fragment | EventMetadata_CollectionMetadataUpdated_Fragment | EventMetadata_CollectionUpdated_Fragment | EventMetadata_CustomerCreated_Fragment | EventMetadata_CustomerMetadataUpdated_Fragment | EventMetadata_CustomerUpdated_Fragment | EventMetadata_DraftOrderCreated_Fragment | EventMetadata_DraftOrderDeleted_Fragment | EventMetadata_DraftOrderUpdated_Fragment | EventMetadata_FulfillmentApproved_Fragment | EventMetadata_FulfillmentCanceled_Fragment | EventMetadata_FulfillmentCreated_Fragment | EventMetadata_FulfillmentMetadataUpdated_Fragment | EventMetadata_FulfillmentTrackingNumberUpdated_Fragment | EventMetadata_GiftCardCreated_Fragment | EventMetadata_GiftCardDeleted_Fragment | EventMetadata_GiftCardExportCompleted_Fragment | EventMetadata_GiftCardMetadataUpdated_Fragment | EventMetadata_GiftCardSent_Fragment | EventMetadata_GiftCardStatusChanged_Fragment | EventMetadata_GiftCardUpdated_Fragment | EventMetadata_InvoiceDeleted_Fragment | EventMetadata_InvoiceRequested_Fragment | EventMetadata_InvoiceSent_Fragment | EventMetadata_ListStoredPaymentMethods_Fragment | EventMetadata_MenuCreated_Fragment | EventMetadata_MenuDeleted_Fragment | EventMetadata_MenuItemCreated_Fragment | EventMetadata_MenuItemDeleted_Fragment | EventMetadata_MenuItemUpdated_Fragment | EventMetadata_MenuUpdated_Fragment | EventMetadata_OrderBulkCreated_Fragment | EventMetadata_OrderCancelled_Fragment | EventMetadata_OrderConfirmed_Fragment | EventMetadata_OrderCreated_Fragment | EventMetadata_OrderExpired_Fragment | EventMetadata_OrderFilterShippingMethods_Fragment | EventMetadata_OrderFulfilled_Fragment | EventMetadata_OrderFullyPaid_Fragment | EventMetadata_OrderFullyRefunded_Fragment | EventMetadata_OrderMetadataUpdated_Fragment | EventMetadata_OrderPaid_Fragment | EventMetadata_OrderRefunded_Fragment | EventMetadata_OrderUpdated_Fragment | EventMetadata_PageCreated_Fragment | EventMetadata_PageDeleted_Fragment | EventMetadata_PageTypeCreated_Fragment | EventMetadata_PageTypeDeleted_Fragment | EventMetadata_PageTypeUpdated_Fragment | EventMetadata_PageUpdated_Fragment | EventMetadata_PaymentAuthorize_Fragment | EventMetadata_PaymentCaptureEvent_Fragment | EventMetadata_PaymentConfirmEvent_Fragment | EventMetadata_PaymentGatewayInitializeSession_Fragment | EventMetadata_PaymentGatewayInitializeTokenizationSession_Fragment | EventMetadata_PaymentListGateways_Fragment | EventMetadata_PaymentMethodInitializeTokenizationSession_Fragment | EventMetadata_PaymentMethodProcessTokenizationSession_Fragment | EventMetadata_PaymentProcessEvent_Fragment | EventMetadata_PaymentRefundEvent_Fragment | EventMetadata_PaymentVoidEvent_Fragment | EventMetadata_PermissionGroupCreated_Fragment | EventMetadata_PermissionGroupDeleted_Fragment | EventMetadata_PermissionGroupUpdated_Fragment | EventMetadata_ProductCreated_Fragment | EventMetadata_ProductDeleted_Fragment | EventMetadata_ProductExportCompleted_Fragment | EventMetadata_ProductMediaCreated_Fragment | EventMetadata_ProductMediaDeleted_Fragment | EventMetadata_ProductMediaUpdated_Fragment | EventMetadata_ProductMetadataUpdated_Fragment | EventMetadata_ProductUpdated_Fragment | EventMetadata_ProductVariantBackInStock_Fragment | EventMetadata_ProductVariantCreated_Fragment | EventMetadata_ProductVariantDeleted_Fragment | EventMetadata_ProductVariantDiscountedPriceUpdated_Fragment | EventMetadata_ProductVariantMetadataUpdated_Fragment | EventMetadata_ProductVariantOutOfStock_Fragment | EventMetadata_ProductVariantStockUpdated_Fragment | EventMetadata_ProductVariantUpdated_Fragment | EventMetadata_PromotionCreated_Fragment | EventMetadata_PromotionDeleted_Fragment | EventMetadata_PromotionEnded_Fragment | EventMetadata_PromotionRuleCreated_Fragment | EventMetadata_PromotionRuleDeleted_Fragment | EventMetadata_PromotionRuleUpdated_Fragment | EventMetadata_PromotionStarted_Fragment | EventMetadata_PromotionUpdated_Fragment | EventMetadata_SaleCreated_Fragment | EventMetadata_SaleDeleted_Fragment | EventMetadata_SaleToggle_Fragment | EventMetadata_SaleUpdated_Fragment | EventMetadata_ShippingListMethodsForCheckout_Fragment | EventMetadata_ShippingPriceCreated_Fragment | EventMetadata_ShippingPriceDeleted_Fragment | EventMetadata_ShippingPriceUpdated_Fragment | EventMetadata_ShippingZoneCreated_Fragment | EventMetadata_ShippingZoneDeleted_Fragment | EventMetadata_ShippingZoneMetadataUpdated_Fragment | EventMetadata_ShippingZoneUpdated_Fragment | EventMetadata_ShopMetadataUpdated_Fragment | EventMetadata_StaffCreated_Fragment | EventMetadata_StaffDeleted_Fragment | EventMetadata_StaffSetPasswordRequested_Fragment | EventMetadata_StaffUpdated_Fragment | EventMetadata_StoredPaymentMethodDeleteRequested_Fragment | EventMetadata_ThumbnailCreated_Fragment | EventMetadata_TransactionCancelationRequested_Fragment | EventMetadata_TransactionChargeRequested_Fragment | EventMetadata_TransactionInitializeSession_Fragment | EventMetadata_TransactionItemMetadataUpdated_Fragment | EventMetadata_TransactionProcessSession_Fragment | EventMetadata_TransactionRefundRequested_Fragment | EventMetadata_TranslationCreated_Fragment | EventMetadata_TranslationUpdated_Fragment | EventMetadata_VoucherCodeExportCompleted_Fragment | EventMetadata_VoucherCodesCreated_Fragment | EventMetadata_VoucherCodesDeleted_Fragment | EventMetadata_VoucherCreated_Fragment | EventMetadata_VoucherDeleted_Fragment | EventMetadata_VoucherMetadataUpdated_Fragment | EventMetadata_VoucherUpdated_Fragment | EventMetadata_WarehouseCreated_Fragment | EventMetadata_WarehouseDeleted_Fragment | EventMetadata_WarehouseMetadataUpdated_Fragment | EventMetadata_WarehouseUpdated_Fragment;

type SourceObject_Checkout_Fragment = { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } };

type SourceObject_Order_Fragment = { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } };

export type SourceObjectFragment = SourceObject_Checkout_Fragment | SourceObject_Order_Fragment;

export type TransactionEventReportWithPaymentDetailsMutationVariables = Exact<{
  transactionId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
  amount: Scalars['PositiveDecimal']['input'];
  pspReference: Scalars['String']['input'];
  time: Scalars['DateTime']['input'];
  type: TransactionEventTypeEnum;
  availableActions?: InputMaybe<ReadonlyArray<TransactionActionEnum> | TransactionActionEnum>;
  externalUrl?: InputMaybe<Scalars['String']['input']>;
  paymentMethodDetails?: InputMaybe<PaymentMethodDetailsInput>;
}>;


export type TransactionEventReportWithPaymentDetailsMutation = { readonly transactionEventReport?: { readonly alreadyProcessed?: boolean | null, readonly errors: ReadonlyArray<{ readonly message?: string | null, readonly code: TransactionEventReportErrorCode }>, readonly transactionEvent?: { readonly id: string } | null } | null };

export type TransactionEventReportMutationVariables = Exact<{
  transactionId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
  amount: Scalars['PositiveDecimal']['input'];
  pspReference: Scalars['String']['input'];
  time: Scalars['DateTime']['input'];
  type: TransactionEventTypeEnum;
  availableActions?: InputMaybe<ReadonlyArray<TransactionActionEnum> | TransactionActionEnum>;
  externalUrl?: InputMaybe<Scalars['String']['input']>;
}>;


export type TransactionEventReportMutation = { readonly transactionEventReport?: { readonly alreadyProcessed?: boolean | null, readonly errors: ReadonlyArray<{ readonly message?: string | null, readonly code: TransactionEventReportErrorCode }>, readonly transactionEvent?: { readonly id: string } | null } | null };

export type FetchChannelsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchChannelsQuery = { readonly channels?: ReadonlyArray<{ readonly id: string, readonly slug: string }> | null };

export type PaymentGatewayInitializeSessionEventFragment = { readonly version?: string | null, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null };

export type PaymentGatewayInitializeSessionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type PaymentGatewayInitializeSessionSubscription = { readonly event?: { readonly version?: string | null, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null } | {} | null };

export type TransactionCancelationRequestedEventFragment = { readonly version?: string | null, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null };

export type TransactionCancelationRequestedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type TransactionCancelationRequestedSubscription = { readonly event?: { readonly version?: string | null, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null } | {} | null };

export type TransactionChargeRequestedEventFragment = { readonly version?: string | null, readonly action: { readonly amount: number }, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null };

export type TransactionChargeRequestedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type TransactionChargeRequestedSubscription = { readonly event?: { readonly version?: string | null, readonly action: { readonly amount: number }, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null } | {} | null };

export type TransactionInitializeSessionEventFragment = { readonly data?: JSONValue | null, readonly idempotencyKey: string, readonly version?: string | null, readonly action: { readonly amount: number, readonly currency: string, readonly actionType: TransactionFlowStrategyEnum }, readonly transaction: { readonly id: string }, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null };

export type TransactionInitializeSessionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type TransactionInitializeSessionSubscription = { readonly event?: { readonly data?: JSONValue | null, readonly idempotencyKey: string, readonly version?: string | null, readonly action: { readonly amount: number, readonly currency: string, readonly actionType: TransactionFlowStrategyEnum }, readonly transaction: { readonly id: string }, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null } | {} | null };

export type TransactionProcessSessionEventFragment = { readonly version?: string | null, readonly transaction: { readonly pspReference: string }, readonly action: { readonly amount: number, readonly actionType: TransactionFlowStrategyEnum }, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null };

export type TransactionProcessSessionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type TransactionProcessSessionSubscription = { readonly event?: { readonly version?: string | null, readonly transaction: { readonly pspReference: string }, readonly action: { readonly amount: number, readonly actionType: TransactionFlowStrategyEnum }, readonly sourceObject: { readonly __typename: 'Checkout', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | { readonly __typename: 'Order', readonly id: string, readonly channel: { readonly id: string, readonly slug: string } }, readonly recipient?: { readonly id: string } | null } | {} | null };

export type TransactionRefundRequestedEventFragment = { readonly version?: string | null, readonly action: { readonly amount: number, readonly currency: string }, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null };

export type TransactionRefundRequestedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type TransactionRefundRequestedSubscription = { readonly event?: { readonly version?: string | null, readonly action: { readonly amount: number, readonly currency: string }, readonly transaction?: { readonly id: string, readonly pspReference: string, readonly checkout?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null, readonly order?: { readonly id: string, readonly channel: { readonly id: string, readonly slug: string } } | null } | null, readonly recipient?: { readonly id: string } | null } | {} | null };

export const UntypedEventMetadataFragmentDoc = gql`
    fragment EventMetadata on Event {
  version
  recipient {
    id
  }
}
    `;
export const UntypedChannelFragmentDoc = gql`
    fragment Channel on Channel {
  id
  slug
}
    `;
export const UntypedSourceObjectFragmentDoc = gql`
    fragment SourceObject on OrderOrCheckout {
  ... on Checkout {
    __typename
    id
    channel {
      ...Channel
    }
  }
  ... on Order {
    __typename
    id
    channel {
      ...Channel
    }
  }
}
    `;
export const UntypedPaymentGatewayInitializeSessionEventFragmentDoc = gql`
    fragment PaymentGatewayInitializeSessionEvent on PaymentGatewayInitializeSession {
  ...EventMetadata
  sourceObject {
    ...SourceObject
  }
}
    `;
export const UntypedTransactionCancelationRequestedEventFragmentDoc = gql`
    fragment TransactionCancelationRequestedEvent on TransactionCancelationRequested {
  ...EventMetadata
  transaction {
    id
    pspReference
    checkout {
      id
      channel {
        ...Channel
      }
    }
    order {
      id
      channel {
        ...Channel
      }
    }
  }
}
    `;
export const UntypedTransactionChargeRequestedEventFragmentDoc = gql`
    fragment TransactionChargeRequestedEvent on TransactionChargeRequested {
  ...EventMetadata
  action {
    amount
  }
  transaction {
    id
    pspReference
    checkout {
      id
      channel {
        ...Channel
      }
    }
    order {
      id
      channel {
        ...Channel
      }
    }
  }
}
    `;
export const UntypedTransactionInitializeSessionEventFragmentDoc = gql`
    fragment TransactionInitializeSessionEvent on TransactionInitializeSession {
  ...EventMetadata
  action {
    amount
    currency
    actionType
  }
  data
  transaction {
    id
  }
  sourceObject {
    ...SourceObject
  }
  idempotencyKey
}
    `;
export const UntypedTransactionProcessSessionEventFragmentDoc = gql`
    fragment TransactionProcessSessionEvent on TransactionProcessSession {
  ...EventMetadata
  transaction {
    pspReference
  }
  action {
    amount
    actionType
  }
  sourceObject {
    ...SourceObject
  }
}
    `;
export const UntypedTransactionRefundRequestedEventFragmentDoc = gql`
    fragment TransactionRefundRequestedEvent on TransactionRefundRequested {
  ...EventMetadata
  action {
    amount
    currency
  }
  transaction {
    id
    pspReference
    checkout {
      id
      channel {
        ...Channel
      }
    }
    order {
      id
      channel {
        ...Channel
      }
    }
  }
}
    `;
export const UntypedTransactionEventReportWithPaymentDetailsDocument = gql`
    mutation TransactionEventReportWithPaymentDetails($transactionId: ID!, $message: String!, $amount: PositiveDecimal!, $pspReference: String!, $time: DateTime!, $type: TransactionEventTypeEnum!, $availableActions: [TransactionActionEnum!], $externalUrl: String, $paymentMethodDetails: PaymentMethodDetailsInput) {
  transactionEventReport(
    id: $transactionId
    message: $message
    amount: $amount
    pspReference: $pspReference
    time: $time
    type: $type
    availableActions: $availableActions
    externalUrl: $externalUrl
    paymentMethodDetails: $paymentMethodDetails
  ) {
    alreadyProcessed
    errors {
      message
      code
    }
    transactionEvent {
      id
    }
  }
}
    `;
export const UntypedTransactionEventReportDocument = gql`
    mutation TransactionEventReport($transactionId: ID!, $message: String!, $amount: PositiveDecimal!, $pspReference: String!, $time: DateTime!, $type: TransactionEventTypeEnum!, $availableActions: [TransactionActionEnum!], $externalUrl: String) {
  transactionEventReport(
    id: $transactionId
    message: $message
    amount: $amount
    pspReference: $pspReference
    time: $time
    type: $type
    availableActions: $availableActions
    externalUrl: $externalUrl
  ) {
    alreadyProcessed
    errors {
      message
      code
    }
    transactionEvent {
      id
    }
  }
}
    `;
export const UntypedFetchChannelsDocument = gql`
    query FetchChannels {
  channels {
    ...Channel
  }
}
    ${UntypedChannelFragmentDoc}`;
export const UntypedPaymentGatewayInitializeSessionDocument = gql`
    subscription PaymentGatewayInitializeSession {
  event {
    ...PaymentGatewayInitializeSessionEvent
  }
}
    ${UntypedPaymentGatewayInitializeSessionEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedSourceObjectFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const UntypedTransactionCancelationRequestedDocument = gql`
    subscription TransactionCancelationRequested {
  event {
    ...TransactionCancelationRequestedEvent
  }
}
    ${UntypedTransactionCancelationRequestedEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const UntypedTransactionChargeRequestedDocument = gql`
    subscription TransactionChargeRequested {
  event {
    ...TransactionChargeRequestedEvent
  }
}
    ${UntypedTransactionChargeRequestedEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const UntypedTransactionInitializeSessionDocument = gql`
    subscription TransactionInitializeSession {
  event {
    ...TransactionInitializeSessionEvent
  }
}
    ${UntypedTransactionInitializeSessionEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedSourceObjectFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const UntypedTransactionProcessSessionDocument = gql`
    subscription TransactionProcessSession {
  event {
    ...TransactionProcessSessionEvent
  }
}
    ${UntypedTransactionProcessSessionEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedSourceObjectFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const UntypedTransactionRefundRequestedDocument = gql`
    subscription TransactionRefundRequested {
  event {
    ...TransactionRefundRequestedEvent
  }
}
    ${UntypedTransactionRefundRequestedEventFragmentDoc}
${UntypedEventMetadataFragmentDoc}
${UntypedChannelFragmentDoc}`;
export const EventMetadataFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<EventMetadataFragment, unknown>;
export const ChannelFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<ChannelFragment, unknown>;
export const SourceObjectFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<SourceObjectFragment, unknown>;
export const PaymentGatewayInitializeSessionEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentGatewayInitializeSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentGatewayInitializeSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]} as unknown as DocumentNode<PaymentGatewayInitializeSessionEventFragment, unknown>;
export const TransactionCancelationRequestedEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionCancelationRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionCancelationRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<TransactionCancelationRequestedEventFragment, unknown>;
export const TransactionChargeRequestedEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionChargeRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionChargeRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<TransactionChargeRequestedEventFragment, unknown>;
export const TransactionInitializeSessionEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionInitializeSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionInitializeSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"actionType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}},{"kind":"Field","name":{"kind":"Name","value":"idempotencyKey"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionInitializeSessionEventFragment, unknown>;
export const TransactionProcessSessionEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionProcessSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionProcessSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pspReference"}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"actionType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionProcessSessionEventFragment, unknown>;
export const TransactionRefundRequestedEventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionRefundRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionRefundRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<TransactionRefundRequestedEventFragment, unknown>;
export const TransactionEventReportWithPaymentDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TransactionEventReportWithPaymentDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PositiveDecimal"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pspReference"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"time"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionEventTypeEnum"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"availableActions"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionActionEnum"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"externalUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"paymentMethodDetails"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentMethodDetailsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionEventReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"pspReference"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pspReference"}}},{"kind":"Argument","name":{"kind":"Name","value":"time"},"value":{"kind":"Variable","name":{"kind":"Name","value":"time"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"availableActions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"availableActions"}}},{"kind":"Argument","name":{"kind":"Name","value":"externalUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"externalUrl"}}},{"kind":"Argument","name":{"kind":"Name","value":"paymentMethodDetails"},"value":{"kind":"Variable","name":{"kind":"Name","value":"paymentMethodDetails"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alreadyProcessed"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactionEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionEventReportWithPaymentDetailsMutation, TransactionEventReportWithPaymentDetailsMutationVariables>;
export const TransactionEventReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TransactionEventReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PositiveDecimal"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pspReference"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"time"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionEventTypeEnum"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"availableActions"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionActionEnum"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"externalUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionEventReport"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"transactionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"pspReference"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pspReference"}}},{"kind":"Argument","name":{"kind":"Name","value":"time"},"value":{"kind":"Variable","name":{"kind":"Name","value":"time"}}},{"kind":"Argument","name":{"kind":"Name","value":"type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"type"}}},{"kind":"Argument","name":{"kind":"Name","value":"availableActions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"availableActions"}}},{"kind":"Argument","name":{"kind":"Name","value":"externalUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"externalUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alreadyProcessed"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactionEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<TransactionEventReportMutation, TransactionEventReportMutationVariables>;
export const FetchChannelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchChannels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"channels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]} as unknown as DocumentNode<FetchChannelsQuery, FetchChannelsQueryVariables>;
export const PaymentGatewayInitializeSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"PaymentGatewayInitializeSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentGatewayInitializeSessionEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentGatewayInitializeSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentGatewayInitializeSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}}]}}]} as unknown as DocumentNode<PaymentGatewayInitializeSessionSubscription, PaymentGatewayInitializeSessionSubscriptionVariables>;
export const TransactionCancelationRequestedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TransactionCancelationRequested"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionCancelationRequestedEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionCancelationRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionCancelationRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TransactionCancelationRequestedSubscription, TransactionCancelationRequestedSubscriptionVariables>;
export const TransactionChargeRequestedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TransactionChargeRequested"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionChargeRequestedEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionChargeRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionChargeRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TransactionChargeRequestedSubscription, TransactionChargeRequestedSubscriptionVariables>;
export const TransactionInitializeSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TransactionInitializeSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionInitializeSessionEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionInitializeSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionInitializeSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"actionType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}},{"kind":"Field","name":{"kind":"Name","value":"idempotencyKey"}}]}}]} as unknown as DocumentNode<TransactionInitializeSessionSubscription, TransactionInitializeSessionSubscriptionVariables>;
export const TransactionProcessSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TransactionProcessSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionProcessSessionEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceObject"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderOrCheckout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionProcessSessionEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionProcessSession"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pspReference"}}]}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"actionType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceObject"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceObject"}}]}}]}}]} as unknown as DocumentNode<TransactionProcessSessionSubscription, TransactionProcessSessionSubscriptionVariables>;
export const TransactionRefundRequestedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"TransactionRefundRequested"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TransactionRefundRequestedEvent"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventMetadata"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Channel"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Channel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionRefundRequestedEvent"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TransactionRefundRequested"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventMetadata"}},{"kind":"Field","name":{"kind":"Name","value":"action"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transaction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pspReference"}},{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Channel"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TransactionRefundRequestedSubscription, TransactionRefundRequestedSubscriptionVariables>;