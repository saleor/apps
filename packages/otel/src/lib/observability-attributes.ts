export const ObservabilityAttributes = {
  ADYEN_ENV: "adyenEnv",
  SALEOR_API_URL: "saleorApiUrl",
  SALEOR_VERSION: "saleorVersion",
  CHANNEL_SLUG: "channelSlug",
  TRANSACTION_ID: "transactionId",
} as const;

export enum AttributeNames {
  OPERATION_TYPE = "graphql.operation.type",
  OPERATION_NAME = "graphql.operation.name",
  OPERATION_BODY = "graphql.operation.body",
  OPERATION_KEY = "graphql.operation.key",
  VARIABLES = "graphql.variables.",
}