import request from "graphql-request";

import { graphql } from "../generated/gql";

const installAppMutationDocument = graphql(/* GraphQL */ `
  mutation InstallApp($input: AppInstallInput!) {
    appInstall(input: $input) {
      appInstallation {
        id
        status
        appName
      }
      errors {
        field
        message
      }
    }
  }
`);

export const installAppMutation = async ({
  saleorApiUrl,
  token,
  appName,
  manifestUrl,
}: {
  saleorApiUrl: string;
  token: string;
  manifestUrl: string;
  appName: string;
}) => {
  const { appInstall } = await request(
    saleorApiUrl,
    installAppMutationDocument,
    {
      input: {
        manifestUrl,
        activateAfterInstallation: true,
        appName,
      },
    },
    { "Authorization-Bearer": token }
  );

  if (appInstall?.errors.length) {
    console.log("Sth went wrong", appInstall.errors);
    throw new Error(`Install app ${appName} mutation failed`);
  }

  if (!appInstall?.appInstallation) {
    console.log("App installation not returned");
    throw new Error(
      `Install app ${appName} mutation failed - no app installation data in the response`
    );
  }

  return appInstall?.appInstallation;
};
