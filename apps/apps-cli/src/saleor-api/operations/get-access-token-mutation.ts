import request from "graphql-request";
import { graphql } from "../generated/gql";

const getAccessTokenMutationDocument = graphql(/* GraphQL */ `
  mutation GetAccessToken($email: String!, $password: String!) {
    tokenCreate(email: $email, password: $password) {
      token
      refreshToken
      errors {
        field
        message
      }
    }
  }
`);

export const getAccessTokenMutation = async ({
  saleorApiUrl,
  email,
  password,
}: {
  saleorApiUrl: string;
  password: string;
  email: string;
}) => {
  const { tokenCreate } = await request(saleorApiUrl, getAccessTokenMutationDocument, {
    email,
    password,
  });

  if (tokenCreate?.errors.length) {
    console.log("mutation failed", tokenCreate?.errors);
    throw new Error(`Get access token mutation failed - API returned errors`);
  }
  const token = tokenCreate?.token;

  if (!token) {
    throw new Error(`Get access token mutation failed - no token in the response`);
  }

  return token;
};
