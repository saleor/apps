export const ObservabilityAttributes = {
  SALEOR_API_URL: "saleorApiUrl",
  SALEOR_VERSION: "saleorVersion",
  CHANNEL_SLUG: "channelSlug",
  TRANSACTION_ID: "transactionId",
  ORDER_ID: "orderId",
  CHECKOUT_ID: "checkoutId",
} as const;

export enum GraphQLAttributeNames {
  OPERATION_TYPE = "graphql.operation.type",
  OPERATION_NAME = "graphql.operation.name",
  OPERATION_BODY = "graphql.operation.body",
  OPERATION_KEY = "graphql.operation.key",
  VARIABLES = "graphql.variables.",
}
