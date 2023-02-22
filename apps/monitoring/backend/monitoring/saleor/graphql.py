GET_APP_INFO = """
query GetAppInfo {
  app {
    id
    webhooks {
      id
      targetUrl
      isActive
    }
    privateMetafields
  }
}

"""

UPDATE_PRIVATE_METADATA = """
mutation UpdatePrivateMetadata($appId: ID!, $metadata: [MetadataInput!]!) {
  updatePrivateMetadata(id: $appId, input: $metadata) {
    errors {
      field
      message
      code
    }
    item {
      privateMetafields
    }
  }
}

"""

DELETE_PRIVATE_METADATA = """
mutation DeletePrivateMetadata($appId: ID!, $keys: [String!]!) {
  deletePrivateMetadata(id: $appId, keys: $keys) {
    errors {
      field
      message
      code
    }
    item {
      privateMetafields
    }
  }
}

"""

CREATE_WEBHOOK = """
mutation WebhookCreate($input: WebhookCreateInput!) {
  webhookCreate(input: $input) {
    webhookErrors {
      field
      message
      code
    }
    webhook {
      id
    }
  }
}

"""
