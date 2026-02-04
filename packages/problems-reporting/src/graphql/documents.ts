import { parse } from "graphql";

export const AppProblemCreateDocument = parse(/* GraphQL */ `
  mutation AppProblemCreate($input: AppProblemCreateInput!) {
    appProblemCreate(input: $input) {
      errors {
        field
        message
        code
      }
    }
  }
`);

export const AppProblemDismissDocument = parse(/* GraphQL */ `
  mutation AppProblemDismiss($keys: [String!]) {
    appProblemDismiss(keys: $keys) {
      errors {
        field
        message
        code
      }
    }
  }
`);
