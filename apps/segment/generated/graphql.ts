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

export type MetadataInput = {
  /** Key of a metadata item. */
  readonly key: Scalars['String']['input'];
  /** Value of a metadata item. */
  readonly value: Scalars['String']['input'];
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

export type OrderBaseFragment = { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> };

export type EnableWebhookMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EnableWebhookMutation = { readonly webhookUpdate?: { readonly errors: ReadonlyArray<{ readonly message?: string | null, readonly code: WebhookErrorCode }> } | null };

export type UpdateAppMetadataMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ReadonlyArray<MetadataInput> | MetadataInput;
}>;


export type UpdateAppMetadataMutation = { readonly updatePrivateMetadata?: { readonly item?: { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | { readonly privateMetadata: ReadonlyArray<{ readonly key: string, readonly value: string }> } | null } | null };

export type FetchAppWebhooksQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FetchAppWebhooksQuery = { readonly app?: { readonly webhooks?: ReadonlyArray<{ readonly id: string, readonly isActive: boolean }> | null } | null };

export type OrderCancelledSubscriptionPayloadFragment = { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null };

export type OrderCancelledSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderCancelledSubscription = { readonly event?: { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null } | {} | null };

export type OrderConfirmedSubscriptionPayloadFragment = { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null };

export type OrderConfirmedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderConfirmedSubscription = { readonly event?: { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null } | {} | null };

export type OrderRefundedSubscriptionPayloadFragment = { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null };

export type OrderRefundedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderRefundedSubscription = { readonly event?: { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null } | {} | null };

export type OrderUpdatedSubscriptionPayloadFragment = { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null };

export type OrderUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OrderUpdatedSubscription = { readonly event?: { readonly issuedAt?: string | null, readonly order?: { readonly id: string, readonly userEmail?: string | null, readonly voucherCode?: string | null, readonly user?: { readonly id: string } | null, readonly channel: { readonly id: string }, readonly total: { readonly gross: { readonly amount: number, readonly currency: string }, readonly tax: { readonly amount: number } }, readonly undiscountedTotal: { readonly gross: { readonly amount: number } }, readonly shippingPrice: { readonly gross: { readonly amount: number } }, readonly lines: ReadonlyArray<{ readonly id: string, readonly quantity: number, readonly voucherCode?: string | null, readonly productSku?: string | null, readonly totalPrice: { readonly gross: { readonly amount: number } }, readonly variant?: { readonly name: string, readonly product: { readonly name: string, readonly category?: { readonly name: string } | null } } | null }> } | null } | {} | null };

export const UntypedOrderBaseFragmentDoc = gql`
    fragment OrderBase on Order {
  id
  user {
    id
  }
  channel {
    id
  }
  userEmail
  total {
    gross {
      amount
      currency
    }
    tax {
      amount
    }
  }
  undiscountedTotal {
    gross {
      amount
    }
  }
  shippingPrice {
    gross {
      amount
    }
  }
  voucherCode
  lines {
    id
    quantity
    totalPrice {
      gross {
        amount
      }
    }
    voucherCode
    productSku
    variant {
      name
      product {
        name
        category {
          name
        }
      }
    }
  }
}
    `;
export const UntypedOrderCancelledSubscriptionPayloadFragmentDoc = gql`
    fragment OrderCancelledSubscriptionPayload on OrderCancelled {
  issuedAt
  order {
    ...OrderBase
  }
}
    `;
export const UntypedOrderConfirmedSubscriptionPayloadFragmentDoc = gql`
    fragment OrderConfirmedSubscriptionPayload on OrderConfirmed {
  issuedAt
  order {
    ...OrderBase
  }
}
    `;
export const UntypedOrderRefundedSubscriptionPayloadFragmentDoc = gql`
    fragment OrderRefundedSubscriptionPayload on OrderRefunded {
  issuedAt
  order {
    ...OrderBase
  }
}
    `;
export const UntypedOrderUpdatedSubscriptionPayloadFragmentDoc = gql`
    fragment OrderUpdatedSubscriptionPayload on OrderUpdated {
  issuedAt
  order {
    ...OrderBase
  }
}
    `;
export const UntypedEnableWebhookDocument = gql`
    mutation EnableWebhook($id: ID!) {
  webhookUpdate(id: $id, input: {isActive: true}) {
    errors {
      message
      code
    }
  }
}
    `;
export const UntypedUpdateAppMetadataDocument = gql`
    mutation UpdateAppMetadata($id: ID!, $input: [MetadataInput!]!) {
  updatePrivateMetadata(id: $id, input: $input) {
    item {
      privateMetadata {
        key
        value
      }
    }
  }
}
    `;
export const UntypedFetchAppWebhooksDocument = gql`
    query FetchAppWebhooks($id: ID!) {
  app(id: $id) {
    webhooks {
      id
      isActive
    }
  }
}
    `;
export const UntypedOrderCancelledDocument = gql`
    subscription OrderCancelled {
  event {
    ...OrderCancelledSubscriptionPayload
  }
}
    ${UntypedOrderCancelledSubscriptionPayloadFragmentDoc}
${UntypedOrderBaseFragmentDoc}`;
export const UntypedOrderConfirmedDocument = gql`
    subscription OrderConfirmed {
  event {
    ...OrderConfirmedSubscriptionPayload
  }
}
    ${UntypedOrderConfirmedSubscriptionPayloadFragmentDoc}
${UntypedOrderBaseFragmentDoc}`;
export const UntypedOrderRefundedDocument = gql`
    subscription OrderRefunded {
  event {
    ...OrderRefundedSubscriptionPayload
  }
}
    ${UntypedOrderRefundedSubscriptionPayloadFragmentDoc}
${UntypedOrderBaseFragmentDoc}`;
export const UntypedOrderUpdatedDocument = gql`
    subscription OrderUpdated {
  event {
    ...OrderUpdatedSubscriptionPayload
  }
}
    ${UntypedOrderUpdatedSubscriptionPayloadFragmentDoc}
${UntypedOrderBaseFragmentDoc}`;
export const OrderBaseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderBaseFragment, unknown>;
export const OrderCancelledSubscriptionPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderCancelledSubscriptionPayloadFragment, unknown>;
export const OrderConfirmedSubscriptionPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderConfirmedSubscriptionPayloadFragment, unknown>;
export const OrderRefundedSubscriptionPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRefundedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderRefunded"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderRefundedSubscriptionPayloadFragment, unknown>;
export const OrderUpdatedSubscriptionPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderUpdatedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrderUpdatedSubscriptionPayloadFragment, unknown>;
export const EnableWebhookDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnableWebhook"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhookUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"isActive"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<EnableWebhookMutation, EnableWebhookMutationVariables>;
export const UpdateAppMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAppMetadata"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MetadataInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePrivateMetadata"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privateMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAppMetadataMutation, UpdateAppMetadataMutationVariables>;
export const FetchAppWebhooksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchAppWebhooks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webhooks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<FetchAppWebhooksQuery, FetchAppWebhooksQueryVariables>;
export const OrderCancelledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderCancelled"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderCancelledSubscriptionPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderCancelledSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderCancelled"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}}]} as unknown as DocumentNode<OrderCancelledSubscription, OrderCancelledSubscriptionVariables>;
export const OrderConfirmedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderConfirmed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmedSubscriptionPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderConfirmed"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}}]} as unknown as DocumentNode<OrderConfirmedSubscription, OrderConfirmedSubscriptionVariables>;
export const OrderRefundedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderRefunded"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderRefundedSubscriptionPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderRefundedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderRefunded"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}}]} as unknown as DocumentNode<OrderRefundedSubscription, OrderRefundedSubscriptionVariables>;
export const OrderUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OrderUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderUpdatedSubscriptionPayload"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderBase"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"channel"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"total"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"undiscountedTotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gross"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"voucherCode"}},{"kind":"Field","name":{"kind":"Name","value":"productSku"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderUpdatedSubscriptionPayload"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderUpdated"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderBase"}}]}}]}}]} as unknown as DocumentNode<OrderUpdatedSubscription, OrderUpdatedSubscriptionVariables>;