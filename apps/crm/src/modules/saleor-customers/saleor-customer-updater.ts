import gql from "graphql-tag";
import { Client } from "urql";
import type { UpdateCustomerMetadataMutationVariables } from "../../../generated/graphql";

// todo - should use mailchimp ID or client_id?
const updateCustomerMetadata = gql`
  mutation UpdateCustomerMetadata($customerId: ID!, $mailchimpId: String!) {
    updateMetadata(id: $customerId, input: { key: "mailchimp_id", value: $mailchimpId }) {
      errors {
        message
      }
    }
  }
`;

export class SaleorCustomerUpdater {
  constructor(private apiClient: Client) {}

  setMailchimpIdInMetadata(metadata: { customerId: string; mailchimpId: string }) {
    const vars: UpdateCustomerMetadataMutationVariables = {
      customerId,
      mailchimpId,
    };

    // todo fix typings
    return this.apiClient.mutation(updateCustomerMetadata, vars);
  }
}
