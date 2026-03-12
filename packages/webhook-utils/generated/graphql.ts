import gql from 'graphql-tag';
import * as Urql from 'urql';
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

export type WebhookCreateInput = {
  /** ID of the app to which webhook belongs. */
  readonly app?: InputMaybe<Scalars['ID']['input']>;
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /** Custom headers, which will be added to HTTP request. There is a limitation of 5 headers per webhook and 998 characters per header.Only `X-*`, `Authorization*`, and `BrokerProperties` keys are allowed. */
  readonly customHeaders?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * The events that webhook wants to subscribe.
   * @deprecated Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events?: InputMaybe<ReadonlyArray<WebhookEventTypeEnum>>;
  /** Determine if webhook will be set active or not. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** The name of the webhook. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Subscription query used to define a webhook payload. */
  readonly query?: InputMaybe<Scalars['String']['input']>;
  /**
   * The secret key used to create a hash signature with each payload.
   * @deprecated As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: InputMaybe<Scalars['String']['input']>;
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl?: InputMaybe<Scalars['String']['input']>;
};

export type WebhookErrorCode =
  | 'DELETE_FAILED'
  | 'GRAPHQL_ERROR'
  | 'INVALID'
  | 'INVALID_CUSTOM_HEADERS'
  | 'INVALID_NOTIFY_WITH_SUBSCRIPTION'
  | 'MISSING_EVENT'
  | 'MISSING_SUBSCRIPTION'
  | 'NOT_FOUND'
  | 'REQUIRED'
  | 'SYNTAX'
  | 'UNABLE_TO_PARSE'
  | 'UNIQUE';

/** Enum determining type of webhook. */
export type WebhookEventTypeAsyncEnum =
  /** An account email change is requested. */
  | 'ACCOUNT_CHANGE_EMAIL_REQUESTED'
  /** An account confirmation is requested. */
  | 'ACCOUNT_CONFIRMATION_REQUESTED'
  /** An account is confirmed. */
  | 'ACCOUNT_CONFIRMED'
  /** An account is deleted. */
  | 'ACCOUNT_DELETED'
  /** An account delete is requested. */
  | 'ACCOUNT_DELETE_REQUESTED'
  /** An account email was changed */
  | 'ACCOUNT_EMAIL_CHANGED'
  /** Setting a new password for the account is requested. */
  | 'ACCOUNT_SET_PASSWORD_REQUESTED'
  /** A new address created. */
  | 'ADDRESS_CREATED'
  /** An address deleted. */
  | 'ADDRESS_DELETED'
  /** An address updated. */
  | 'ADDRESS_UPDATED'
  /** All the events. */
  | 'ANY_EVENTS'
  /** An app deleted. */
  | 'APP_DELETED'
  /** A new app installed. */
  | 'APP_INSTALLED'
  /** An app status is changed. */
  | 'APP_STATUS_CHANGED'
  /** An app updated. */
  | 'APP_UPDATED'
  /** A new attribute is created. */
  | 'ATTRIBUTE_CREATED'
  /** An attribute is deleted. */
  | 'ATTRIBUTE_DELETED'
  /** An attribute is updated. */
  | 'ATTRIBUTE_UPDATED'
  /** A new attribute value is created. */
  | 'ATTRIBUTE_VALUE_CREATED'
  /** An attribute value is deleted. */
  | 'ATTRIBUTE_VALUE_DELETED'
  /** An attribute value is updated. */
  | 'ATTRIBUTE_VALUE_UPDATED'
  /** A new category created. */
  | 'CATEGORY_CREATED'
  /** A category is deleted. */
  | 'CATEGORY_DELETED'
  /** A category is updated. */
  | 'CATEGORY_UPDATED'
  /** A new channel created. */
  | 'CHANNEL_CREATED'
  /** A channel is deleted. */
  | 'CHANNEL_DELETED'
  /** A channel metadata is updated. */
  | 'CHANNEL_METADATA_UPDATED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /**
   * A checkout was fully authorized (its `authorizeStatus` is `FULL`).
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_AUTHORIZED'
  /**
   * A checkout was fully paid (its `chargeStatus` is `FULL` or `OVERCHARGED`). This event is not sent if payments are only authorized but not fully charged.
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_PAID'
  /** A checkout metadata is updated. */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /** A collection metadata is updated. */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /** A customer account metadata is updated. */
  | 'CUSTOMER_METADATA_UPDATED'
  /** A customer account is updated. */
  | 'CUSTOMER_UPDATED'
  /** A draft order is created. */
  | 'DRAFT_ORDER_CREATED'
  /** A draft order is deleted. */
  | 'DRAFT_ORDER_DELETED'
  /** A draft order is updated. */
  | 'DRAFT_ORDER_UPDATED'
  /** A fulfillment is approved. */
  | 'FULFILLMENT_APPROVED'
  /** A fulfillment is cancelled. */
  | 'FULFILLMENT_CANCELED'
  /** A new fulfillment is created. */
  | 'FULFILLMENT_CREATED'
  /** A fulfillment metadata is updated. */
  | 'FULFILLMENT_METADATA_UPDATED'
  | 'FULFILLMENT_TRACKING_NUMBER_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /** A gift card export is completed. */
  | 'GIFT_CARD_EXPORT_COMPLETED'
  /** A gift card metadata is updated. */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card has been sent. */
  | 'GIFT_CARD_SENT'
  /** A gift card status is changed. */
  | 'GIFT_CARD_STATUS_CHANGED'
  /** A gift card is updated. */
  | 'GIFT_CARD_UPDATED'
  /** An invoice is deleted. */
  | 'INVOICE_DELETED'
  /** An invoice for order requested. */
  | 'INVOICE_REQUESTED'
  /** Invoice has been sent. */
  | 'INVOICE_SENT'
  /** A new menu created. */
  | 'MENU_CREATED'
  /** A menu is deleted. */
  | 'MENU_DELETED'
  /** A new menu item created. */
  | 'MENU_ITEM_CREATED'
  /** A menu item is deleted. */
  | 'MENU_ITEM_DELETED'
  /** A menu item is updated. */
  | 'MENU_ITEM_UPDATED'
  /** A menu is updated. */
  | 'MENU_UPDATED'
  /** User notification triggered. */
  | 'NOTIFY_USER'
  /** An observability event is created. */
  | 'OBSERVABILITY'
  /** Orders are imported. */
  | 'ORDER_BULK_CREATED'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** An order is expired. */
  | 'ORDER_EXPIRED'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /** The order is fully refunded. */
  | 'ORDER_FULLY_REFUNDED'
  /** An order metadata is updated. */
  | 'ORDER_METADATA_UPDATED'
  /** Payment has been made. The order may be partially or fully paid. */
  | 'ORDER_PAID'
  /** The order received a refund. The order may be partially or fully refunded. */
  | 'ORDER_REFUNDED'
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | 'ORDER_UPDATED'
  /** A new page is created. */
  | 'PAGE_CREATED'
  /** A page is deleted. */
  | 'PAGE_DELETED'
  /** A new page type is created. */
  | 'PAGE_TYPE_CREATED'
  /** A page type is deleted. */
  | 'PAGE_TYPE_DELETED'
  /** A page type is updated. */
  | 'PAGE_TYPE_UPDATED'
  /** A page is updated. */
  | 'PAGE_UPDATED'
  /** A new permission group is created. */
  | 'PERMISSION_GROUP_CREATED'
  /** A permission group is deleted. */
  | 'PERMISSION_GROUP_DELETED'
  /** A permission group is updated. */
  | 'PERMISSION_GROUP_UPDATED'
  /** A new product is created. */
  | 'PRODUCT_CREATED'
  /** A product is deleted. */
  | 'PRODUCT_DELETED'
  /** A product export is completed. */
  | 'PRODUCT_EXPORT_COMPLETED'
  /** A new product media is created. */
  | 'PRODUCT_MEDIA_CREATED'
  /** A product media is deleted. */
  | 'PRODUCT_MEDIA_DELETED'
  /** A product media is updated. */
  | 'PRODUCT_MEDIA_UPDATED'
  /** A product metadata is updated. */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. Warning: this event will not be executed when parent product has been deleted. Check PRODUCT_DELETED. */
  | 'PRODUCT_VARIANT_DELETED'
  /** A product variant metadata is updated. */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant stock is updated */
  | 'PRODUCT_VARIANT_STOCK_UPDATED'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A promotion is created. */
  | 'PROMOTION_CREATED'
  /** A promotion is deleted. */
  | 'PROMOTION_DELETED'
  /** A promotion is deactivated. */
  | 'PROMOTION_ENDED'
  /** A promotion rule is created. */
  | 'PROMOTION_RULE_CREATED'
  /** A promotion rule is deleted. */
  | 'PROMOTION_RULE_DELETED'
  /** A promotion rule is updated. */
  | 'PROMOTION_RULE_UPDATED'
  /** A promotion is activated. */
  | 'PROMOTION_STARTED'
  /** A promotion is updated. */
  | 'PROMOTION_UPDATED'
  /** A sale is created. */
  | 'SALE_CREATED'
  /** A sale is deleted. */
  | 'SALE_DELETED'
  /** A sale is activated or deactivated. */
  | 'SALE_TOGGLE'
  /** A sale is updated. */
  | 'SALE_UPDATED'
  /** A new shipping price is created. */
  | 'SHIPPING_PRICE_CREATED'
  /** A shipping price is deleted. */
  | 'SHIPPING_PRICE_DELETED'
  /** A shipping price is updated. */
  | 'SHIPPING_PRICE_UPDATED'
  /** A new shipping zone is created. */
  | 'SHIPPING_ZONE_CREATED'
  /** A shipping zone is deleted. */
  | 'SHIPPING_ZONE_DELETED'
  /** A shipping zone metadata is updated. */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** Shop metadata is updated. */
  | 'SHOP_METADATA_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** Setting a new password for the staff account is requested. */
  | 'STAFF_SET_PASSWORD_REQUESTED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  /** A thumbnail is created. */
  | 'THUMBNAIL_CREATED'
  /** Transaction item metadata is updated. */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  | 'VOUCHER_CODES_CREATED'
  | 'VOUCHER_CODES_DELETED'
  /**
   * A voucher code export is completed.
   *
   * Added in Saleor 3.18.
   */
  | 'VOUCHER_CODE_EXPORT_COMPLETED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /** A voucher metadata is updated. */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /** A warehouse metadata is updated. */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeEnum =
  /** An account email change is requested. */
  | 'ACCOUNT_CHANGE_EMAIL_REQUESTED'
  /** An account confirmation is requested. */
  | 'ACCOUNT_CONFIRMATION_REQUESTED'
  /** An account is confirmed. */
  | 'ACCOUNT_CONFIRMED'
  /** An account is deleted. */
  | 'ACCOUNT_DELETED'
  /** An account delete is requested. */
  | 'ACCOUNT_DELETE_REQUESTED'
  /** An account email was changed */
  | 'ACCOUNT_EMAIL_CHANGED'
  /** Setting a new password for the account is requested. */
  | 'ACCOUNT_SET_PASSWORD_REQUESTED'
  /** A new address created. */
  | 'ADDRESS_CREATED'
  /** An address deleted. */
  | 'ADDRESS_DELETED'
  /** An address updated. */
  | 'ADDRESS_UPDATED'
  /** All the events. */
  | 'ANY_EVENTS'
  /** An app deleted. */
  | 'APP_DELETED'
  /** A new app installed. */
  | 'APP_INSTALLED'
  /** An app status is changed. */
  | 'APP_STATUS_CHANGED'
  /** An app updated. */
  | 'APP_UPDATED'
  /** A new attribute is created. */
  | 'ATTRIBUTE_CREATED'
  /** An attribute is deleted. */
  | 'ATTRIBUTE_DELETED'
  /** An attribute is updated. */
  | 'ATTRIBUTE_UPDATED'
  /** A new attribute value is created. */
  | 'ATTRIBUTE_VALUE_CREATED'
  /** An attribute value is deleted. */
  | 'ATTRIBUTE_VALUE_DELETED'
  /** An attribute value is updated. */
  | 'ATTRIBUTE_VALUE_UPDATED'
  /** A new category created. */
  | 'CATEGORY_CREATED'
  /** A category is deleted. */
  | 'CATEGORY_DELETED'
  /** A category is updated. */
  | 'CATEGORY_UPDATED'
  /** A new channel created. */
  | 'CHANNEL_CREATED'
  /** A channel is deleted. */
  | 'CHANNEL_DELETED'
  /** A channel metadata is updated. */
  | 'CHANNEL_METADATA_UPDATED'
  /** A channel status is changed. */
  | 'CHANNEL_STATUS_CHANGED'
  /** A channel is updated. */
  | 'CHANNEL_UPDATED'
  /** Event called for checkout tax calculation. */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** A new checkout is created. */
  | 'CHECKOUT_CREATED'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  /**
   * A checkout was fully authorized (its `authorizeStatus` is `FULL`).
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_AUTHORIZED'
  /**
   * A checkout was fully paid (its `chargeStatus` is `FULL` or `OVERCHARGED`). This event is not sent if payments are only authorized but not fully charged.
   *
   * This event is emitted only for checkouts whose payments are processed through the Transaction API.
   */
  | 'CHECKOUT_FULLY_PAID'
  /** A checkout metadata is updated. */
  | 'CHECKOUT_METADATA_UPDATED'
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | 'CHECKOUT_UPDATED'
  /** A new collection is created. */
  | 'COLLECTION_CREATED'
  /** A collection is deleted. */
  | 'COLLECTION_DELETED'
  /** A collection metadata is updated. */
  | 'COLLECTION_METADATA_UPDATED'
  /** A collection is updated. */
  | 'COLLECTION_UPDATED'
  /** A new customer account is created. */
  | 'CUSTOMER_CREATED'
  /** A customer account is deleted. */
  | 'CUSTOMER_DELETED'
  /** A customer account metadata is updated. */
  | 'CUSTOMER_METADATA_UPDATED'
  /** A customer account is updated. */
  | 'CUSTOMER_UPDATED'
  /** A draft order is created. */
  | 'DRAFT_ORDER_CREATED'
  /** A draft order is deleted. */
  | 'DRAFT_ORDER_DELETED'
  /** A draft order is updated. */
  | 'DRAFT_ORDER_UPDATED'
  /** A fulfillment is approved. */
  | 'FULFILLMENT_APPROVED'
  /** A fulfillment is cancelled. */
  | 'FULFILLMENT_CANCELED'
  /** A new fulfillment is created. */
  | 'FULFILLMENT_CREATED'
  /** A fulfillment metadata is updated. */
  | 'FULFILLMENT_METADATA_UPDATED'
  | 'FULFILLMENT_TRACKING_NUMBER_UPDATED'
  /** A new gift card created. */
  | 'GIFT_CARD_CREATED'
  /** A gift card is deleted. */
  | 'GIFT_CARD_DELETED'
  /** A gift card export is completed. */
  | 'GIFT_CARD_EXPORT_COMPLETED'
  /** A gift card metadata is updated. */
  | 'GIFT_CARD_METADATA_UPDATED'
  /** A gift card has been sent. */
  | 'GIFT_CARD_SENT'
  /** A gift card status is changed. */
  | 'GIFT_CARD_STATUS_CHANGED'
  /** A gift card is updated. */
  | 'GIFT_CARD_UPDATED'
  /** An invoice is deleted. */
  | 'INVOICE_DELETED'
  /** An invoice for order requested. */
  | 'INVOICE_REQUESTED'
  /** Invoice has been sent. */
  | 'INVOICE_SENT'
  | 'LIST_STORED_PAYMENT_METHODS'
  /** A new menu created. */
  | 'MENU_CREATED'
  /** A menu is deleted. */
  | 'MENU_DELETED'
  /** A new menu item created. */
  | 'MENU_ITEM_CREATED'
  /** A menu item is deleted. */
  | 'MENU_ITEM_DELETED'
  /** A menu item is updated. */
  | 'MENU_ITEM_UPDATED'
  /** A menu is updated. */
  | 'MENU_UPDATED'
  /** User notification triggered. */
  | 'NOTIFY_USER'
  /** An observability event is created. */
  | 'OBSERVABILITY'
  /** Orders are imported. */
  | 'ORDER_BULK_CREATED'
  /** Event called for order tax calculation. */
  | 'ORDER_CALCULATE_TAXES'
  /** An order is cancelled. */
  | 'ORDER_CANCELLED'
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | 'ORDER_CONFIRMED'
  /** A new order is placed. */
  | 'ORDER_CREATED'
  /** An order is expired. */
  | 'ORDER_EXPIRED'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** An order is fulfilled. */
  | 'ORDER_FULFILLED'
  /** Payment is made and an order is fully paid. */
  | 'ORDER_FULLY_PAID'
  /** The order is fully refunded. */
  | 'ORDER_FULLY_REFUNDED'
  /** An order metadata is updated. */
  | 'ORDER_METADATA_UPDATED'
  /** Payment has been made. The order may be partially or fully paid. */
  | 'ORDER_PAID'
  /** The order received a refund. The order may be partially or fully refunded. */
  | 'ORDER_REFUNDED'
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | 'ORDER_UPDATED'
  /** A new page is created. */
  | 'PAGE_CREATED'
  /** A page is deleted. */
  | 'PAGE_DELETED'
  /** A new page type is created. */
  | 'PAGE_TYPE_CREATED'
  /** A page type is deleted. */
  | 'PAGE_TYPE_DELETED'
  /** A page type is updated. */
  | 'PAGE_TYPE_UPDATED'
  /** A page is updated. */
  | 'PAGE_UPDATED'
  /** Authorize payment. */
  | 'PAYMENT_AUTHORIZE'
  /** Capture payment. */
  | 'PAYMENT_CAPTURE'
  /** Confirm payment. */
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_GATEWAY_INITIALIZE_SESSION'
  | 'PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  | 'PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION'
  | 'PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION'
  /** Process payment. */
  | 'PAYMENT_PROCESS'
  /** Refund payment. */
  | 'PAYMENT_REFUND'
  /** Void payment. */
  | 'PAYMENT_VOID'
  /** A new permission group is created. */
  | 'PERMISSION_GROUP_CREATED'
  /** A permission group is deleted. */
  | 'PERMISSION_GROUP_DELETED'
  /** A permission group is updated. */
  | 'PERMISSION_GROUP_UPDATED'
  /** A new product is created. */
  | 'PRODUCT_CREATED'
  /** A product is deleted. */
  | 'PRODUCT_DELETED'
  /** A product export is completed. */
  | 'PRODUCT_EXPORT_COMPLETED'
  /** A new product media is created. */
  | 'PRODUCT_MEDIA_CREATED'
  /** A product media is deleted. */
  | 'PRODUCT_MEDIA_DELETED'
  /** A product media is updated. */
  | 'PRODUCT_MEDIA_UPDATED'
  /** A product metadata is updated. */
  | 'PRODUCT_METADATA_UPDATED'
  /** A product is updated. */
  | 'PRODUCT_UPDATED'
  /** A product variant is back in stock. */
  | 'PRODUCT_VARIANT_BACK_IN_STOCK'
  /** A new product variant is created. */
  | 'PRODUCT_VARIANT_CREATED'
  /** A product variant is deleted. Warning: this event will not be executed when parent product has been deleted. Check PRODUCT_DELETED. */
  | 'PRODUCT_VARIANT_DELETED'
  /** A product variant metadata is updated. */
  | 'PRODUCT_VARIANT_METADATA_UPDATED'
  /** A product variant is out of stock. */
  | 'PRODUCT_VARIANT_OUT_OF_STOCK'
  /** A product variant stock is updated */
  | 'PRODUCT_VARIANT_STOCK_UPDATED'
  /** A product variant is updated. */
  | 'PRODUCT_VARIANT_UPDATED'
  /** A promotion is created. */
  | 'PROMOTION_CREATED'
  /** A promotion is deleted. */
  | 'PROMOTION_DELETED'
  /** A promotion is deactivated. */
  | 'PROMOTION_ENDED'
  /** A promotion rule is created. */
  | 'PROMOTION_RULE_CREATED'
  /** A promotion rule is deleted. */
  | 'PROMOTION_RULE_DELETED'
  /** A promotion rule is updated. */
  | 'PROMOTION_RULE_UPDATED'
  /** A promotion is activated. */
  | 'PROMOTION_STARTED'
  /** A promotion is updated. */
  | 'PROMOTION_UPDATED'
  /** A sale is created. */
  | 'SALE_CREATED'
  /** A sale is deleted. */
  | 'SALE_DELETED'
  /** A sale is activated or deactivated. */
  | 'SALE_TOGGLE'
  /** A sale is updated. */
  | 'SALE_UPDATED'
  /** Fetch external shipping methods for checkout. */
  | 'SHIPPING_LIST_METHODS_FOR_CHECKOUT'
  /** A new shipping price is created. */
  | 'SHIPPING_PRICE_CREATED'
  /** A shipping price is deleted. */
  | 'SHIPPING_PRICE_DELETED'
  /** A shipping price is updated. */
  | 'SHIPPING_PRICE_UPDATED'
  /** A new shipping zone is created. */
  | 'SHIPPING_ZONE_CREATED'
  /** A shipping zone is deleted. */
  | 'SHIPPING_ZONE_DELETED'
  /** A shipping zone metadata is updated. */
  | 'SHIPPING_ZONE_METADATA_UPDATED'
  /** A shipping zone is updated. */
  | 'SHIPPING_ZONE_UPDATED'
  /** Shop metadata is updated. */
  | 'SHOP_METADATA_UPDATED'
  /** A new staff user is created. */
  | 'STAFF_CREATED'
  /** A staff user is deleted. */
  | 'STAFF_DELETED'
  /** Setting a new password for the staff account is requested. */
  | 'STAFF_SET_PASSWORD_REQUESTED'
  /** A staff user is updated. */
  | 'STAFF_UPDATED'
  | 'STORED_PAYMENT_METHOD_DELETE_REQUESTED'
  /** A thumbnail is created. */
  | 'THUMBNAIL_CREATED'
  /** Event called when cancel has been requested for transaction. */
  | 'TRANSACTION_CANCELATION_REQUESTED'
  /** Event called when charge has been requested for transaction. */
  | 'TRANSACTION_CHARGE_REQUESTED'
  | 'TRANSACTION_INITIALIZE_SESSION'
  /** Transaction item metadata is updated. */
  | 'TRANSACTION_ITEM_METADATA_UPDATED'
  | 'TRANSACTION_PROCESS_SESSION'
  /** Event called when refund has been requested for transaction. */
  | 'TRANSACTION_REFUND_REQUESTED'
  /** A new translation is created. */
  | 'TRANSLATION_CREATED'
  /** A translation is updated. */
  | 'TRANSLATION_UPDATED'
  | 'VOUCHER_CODES_CREATED'
  | 'VOUCHER_CODES_DELETED'
  /**
   * A voucher code export is completed.
   *
   * Added in Saleor 3.18.
   */
  | 'VOUCHER_CODE_EXPORT_COMPLETED'
  /** A new voucher created. */
  | 'VOUCHER_CREATED'
  /** A voucher is deleted. */
  | 'VOUCHER_DELETED'
  /** A voucher metadata is updated. */
  | 'VOUCHER_METADATA_UPDATED'
  /** A voucher is updated. */
  | 'VOUCHER_UPDATED'
  /** A new warehouse created. */
  | 'WAREHOUSE_CREATED'
  /** A warehouse is deleted. */
  | 'WAREHOUSE_DELETED'
  /** A warehouse metadata is updated. */
  | 'WAREHOUSE_METADATA_UPDATED'
  /** A warehouse is updated. */
  | 'WAREHOUSE_UPDATED';

/** Enum determining type of webhook. */
export type WebhookEventTypeSyncEnum =
  /** Event called for checkout tax calculation. */
  | 'CHECKOUT_CALCULATE_TAXES'
  /** Filter shipping methods for checkout. */
  | 'CHECKOUT_FILTER_SHIPPING_METHODS'
  | 'LIST_STORED_PAYMENT_METHODS'
  /** Event called for order tax calculation. */
  | 'ORDER_CALCULATE_TAXES'
  /** Filter shipping methods for order. */
  | 'ORDER_FILTER_SHIPPING_METHODS'
  /** Authorize payment. */
  | 'PAYMENT_AUTHORIZE'
  /** Capture payment. */
  | 'PAYMENT_CAPTURE'
  /** Confirm payment. */
  | 'PAYMENT_CONFIRM'
  | 'PAYMENT_GATEWAY_INITIALIZE_SESSION'
  | 'PAYMENT_GATEWAY_INITIALIZE_TOKENIZATION_SESSION'
  /** Listing available payment gateways. */
  | 'PAYMENT_LIST_GATEWAYS'
  | 'PAYMENT_METHOD_INITIALIZE_TOKENIZATION_SESSION'
  | 'PAYMENT_METHOD_PROCESS_TOKENIZATION_SESSION'
  /** Process payment. */
  | 'PAYMENT_PROCESS'
  /** Refund payment. */
  | 'PAYMENT_REFUND'
  /** Void payment. */
  | 'PAYMENT_VOID'
  /** Fetch external shipping methods for checkout. */
  | 'SHIPPING_LIST_METHODS_FOR_CHECKOUT'
  | 'STORED_PAYMENT_METHOD_DELETE_REQUESTED'
  /** Event called when cancel has been requested for transaction. */
  | 'TRANSACTION_CANCELATION_REQUESTED'
  /** Event called when charge has been requested for transaction. */
  | 'TRANSACTION_CHARGE_REQUESTED'
  | 'TRANSACTION_INITIALIZE_SESSION'
  | 'TRANSACTION_PROCESS_SESSION'
  /** Event called when refund has been requested for transaction. */
  | 'TRANSACTION_REFUND_REQUESTED';

export type WebhookUpdateInput = {
  /** ID of the app to which webhook belongs. */
  readonly app?: InputMaybe<Scalars['ID']['input']>;
  /** The asynchronous events that webhook wants to subscribe. */
  readonly asyncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeAsyncEnum>>;
  /** Custom headers, which will be added to HTTP request. There is a limitation of 5 headers per webhook and 998 characters per header.Only `X-*`, `Authorization*`, and `BrokerProperties` keys are allowed. */
  readonly customHeaders?: InputMaybe<Scalars['JSONString']['input']>;
  /**
   * The events that webhook wants to subscribe.
   * @deprecated Use `asyncEvents` or `syncEvents` instead.
   */
  readonly events?: InputMaybe<ReadonlyArray<WebhookEventTypeEnum>>;
  /** Determine if webhook will be set active or not. */
  readonly isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** The new name of the webhook. */
  readonly name?: InputMaybe<Scalars['String']['input']>;
  /** Subscription query used to define a webhook payload. */
  readonly query?: InputMaybe<Scalars['String']['input']>;
  /**
   * Use to create a hash signature with each payload.
   * @deprecated As of Saleor 3.5, webhook payloads default to signing using a verifiable JWS.
   */
  readonly secretKey?: InputMaybe<Scalars['String']['input']>;
  /** The synchronous events that webhook wants to subscribe. */
  readonly syncEvents?: InputMaybe<ReadonlyArray<WebhookEventTypeSyncEnum>>;
  /** The url to receive the payload. */
  readonly targetUrl?: InputMaybe<Scalars['String']['input']>;
};

export type WebhookDetailsFragmentFragment = { readonly id: string, readonly isActive: boolean, readonly name?: string | null, readonly targetUrl: string, readonly subscriptionQuery?: string | null, readonly syncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeSyncEnum }>, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> };

export type CreateAppWebhookMutationVariables = Exact<{
  input: WebhookCreateInput;
}>;


export type CreateAppWebhookMutation = { readonly webhookCreate?: { readonly webhook?: { readonly id: string, readonly isActive: boolean, readonly name?: string | null, readonly targetUrl: string, readonly subscriptionQuery?: string | null, readonly syncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeSyncEnum }>, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> } | null, readonly errors: ReadonlyArray<{ readonly code: WebhookErrorCode, readonly field?: string | null, readonly message?: string | null }> } | null };

export type ModifyAppWebhookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: WebhookUpdateInput;
}>;


export type ModifyAppWebhookMutation = { readonly webhookUpdate?: { readonly errors: ReadonlyArray<{ readonly message?: string | null }>, readonly webhook?: { readonly id: string, readonly isActive: boolean, readonly name?: string | null, readonly targetUrl: string, readonly subscriptionQuery?: string | null, readonly syncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeSyncEnum }>, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> } | null } | null };

export type RemoveAppWebhookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveAppWebhookMutation = { readonly webhookDelete?: { readonly webhook?: { readonly id: string } | null, readonly errors: ReadonlyArray<{ readonly field?: string | null, readonly message?: string | null }> } | null };

export type GetAppDetailsAndWebhooksDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppDetailsAndWebhooksDataQuery = { readonly app?: { readonly id: string, readonly appUrl?: string | null, readonly name?: string | null, readonly webhooks?: ReadonlyArray<{ readonly id: string, readonly isActive: boolean, readonly name?: string | null, readonly targetUrl: string, readonly subscriptionQuery?: string | null, readonly syncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeSyncEnum }>, readonly asyncEvents: ReadonlyArray<{ readonly name: string, readonly eventType: WebhookEventTypeAsyncEnum }> }> | null } | null };

export type GetSaleorInstanceDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSaleorInstanceDataQuery = { readonly shop: { readonly version: string } };

export const UntypedWebhookDetailsFragmentFragmentDoc = gql`
    fragment WebhookDetailsFragment on Webhook {
  id
  isActive
  name
  targetUrl
  subscriptionQuery
  syncEvents {
    name
    eventType
  }
  asyncEvents {
    name
    eventType
  }
}
    `;
export const UntypedCreateAppWebhookDocument = gql`
    mutation CreateAppWebhook($input: WebhookCreateInput!) {
  webhookCreate(input: $input) {
    webhook {
      ...WebhookDetailsFragment
    }
    errors {
      code
      field
      message
    }
  }
}
    ${UntypedWebhookDetailsFragmentFragmentDoc}`;

export function useCreateAppWebhookMutation() {
  return Urql.useMutation<CreateAppWebhookMutation, CreateAppWebhookMutationVariables>(UntypedCreateAppWebhookDocument);
};
export const UntypedModifyAppWebhookDocument = gql`
    mutation ModifyAppWebhook($id: ID!, $input: WebhookUpdateInput!) {
  webhookUpdate(id: $id, input: $input) {
    errors {
      message
    }
    webhook {
      ...WebhookDetailsFragment
    }
  }
}
    ${UntypedWebhookDetailsFragmentFragmentDoc}`;

export function useModifyAppWebhookMutation() {
  return Urql.useMutation<ModifyAppWebhookMutation, ModifyAppWebhookMutationVariables>(UntypedModifyAppWebhookDocument);
};
export const UntypedRemoveAppWebhookDocument = gql`
    mutation RemoveAppWebhook($id: ID!) {
  webhookDelete(id: $id) {
    webhook {
      id
    }
    errors {
      field
      message
    }
  }
}
    `;

export function useRemoveAppWebhookMutation() {
  return Urql.useMutation<RemoveAppWebhookMutation, RemoveAppWebhookMutationVariables>(UntypedRemoveAppWebhookDocument);
};
export const UntypedGetAppDetailsAndWebhooksDataDocument = gql`
    query GetAppDetailsAndWebhooksData {
  app {
    id
    appUrl
    name
    webhooks {
      ...WebhookDetailsFragment
    }
  }
}
    ${UntypedWebhookDetailsFragmentFragmentDoc}`;

export function useGetAppDetailsAndWebhooksDataQuery(options?: Omit<Urql.UseQueryArgs<GetAppDetailsAndWebhooksDataQueryVariables>, 'query'>) {
  return Urql.useQuery<GetAppDetailsAndWebhooksDataQuery, GetAppDetailsAndWebhooksDataQueryVariables>({ query: UntypedGetAppDetailsAndWebhooksDataDocument, ...options });
};
export const UntypedGetSaleorInstanceDataDocument = gql`
    query GetSaleorInstanceData {
  shop {
    version
  }
}
    `;

export function useGetSaleorInstanceDataQuery(options?: Omit<Urql.UseQueryArgs<GetSaleorInstanceDataQueryVariables>, 'query'>) {
  return Urql.useQuery<GetSaleorInstanceDataQuery, GetSaleorInstanceDataQueryVariables>({ query: UntypedGetSaleorInstanceDataDocument, ...options });
};
export const WebhookDetailsFragmentFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"targetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionQuery"}},{"kind":"Field","name":{"kind":"Name","value":"syncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}}]}}]} as unknown as DocumentNode<WebhookDetailsFragmentFragment, unknown>;
export const CreateAppWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAppWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetailsFragment"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"targetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionQuery"}},{"kind":"Field","name":{"kind":"Name","value":"syncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}}]}}]} as unknown as DocumentNode<CreateAppWebhookMutation, CreateAppWebhookMutationVariables>;
export const ModifyAppWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ModifyAppWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WebhookUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"webhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetailsFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"targetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionQuery"}},{"kind":"Field","name":{"kind":"Name","value":"syncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}}]}}]} as unknown as DocumentNode<ModifyAppWebhookMutation, ModifyAppWebhookMutationVariables>;
export const RemoveAppWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAppWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhook"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveAppWebhookMutation, RemoveAppWebhookMutationVariables>;
export const GetAppDetailsAndWebhooksDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAppDetailsAndWebhooksData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appUrl"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"webhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WebhookDetailsFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WebhookDetailsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Webhook"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"targetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionQuery"}},{"kind":"Field","name":{"kind":"Name","value":"syncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asyncEvents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"eventType"}}]}}]}}]} as unknown as DocumentNode<GetAppDetailsAndWebhooksDataQuery, GetAppDetailsAndWebhooksDataQueryVariables>;
export const GetSaleorInstanceDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSaleorInstanceData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<GetSaleorInstanceDataQuery, GetSaleorInstanceDataQueryVariables>;