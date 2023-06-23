import request from "graphql-request";

import { graphql } from "../generated/gql";
import { AppErrorCode } from "../generated/graphql";

const uninstallAppMutationDocument = graphql(/* GraphQL */ `
  mutation UninstallApp($id: ID!) {
    appDelete(id: $id) {
      errors {
        field
        message
        code
      }
    }
  }
`);

export const uninstallAppMutation = async ({
  saleorApiUrl,
  token,
  id,
}: {
  saleorApiUrl: string;
  token: string;
  id: string;
}) => {
  const { appDelete } = await request(
    saleorApiUrl,
    uninstallAppMutationDocument,
    {
      id,
    },
    { "Authorization-Bearer": token }
  );

  if (appDelete?.errors.length) {
    const error = appDelete.errors[0];

    if (error.code === AppErrorCode.NotFound) {
      throw new Error(`Uninstall app ${id} mutation failed - no installed app with this ID`);
    }
    throw new Error(
      `Uninstall app ${id} mutation failed. API responded with error: ${error.code} - ${error.message}`
    );
  }

  return;
};
