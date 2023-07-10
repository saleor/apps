import { Client, gql } from "urql";
import {
  FetchAppPermissionsDocument,
  FetchAppPermissionsQuery,
  PermissionEnum,
} from "../../generated/graphql";

gql`
  query FetchAppPermissions {
    app {
      permissions {
        code
      }
    }
  }
`;

export async function fetchAppPermissions(client: Client): Promise<PermissionEnum[]> {
  const { error, data } = await client
    .query<FetchAppPermissionsQuery>(FetchAppPermissionsDocument, {})
    .toPromise();

  if (error) {
    return [];
  }

  return data?.app?.permissions?.map((p) => p.code) || [];
}
