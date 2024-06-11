import { Client, gql } from "urql";
import {
  FetchAppPermissionsDocument,
  FetchAppPermissionsQuery,
  PermissionEnum,
} from "../../generated/graphql";
import { createLogger } from "../logger";

gql`
  query FetchAppPermissions {
    app {
      permissions {
        code
      }
    }
  }
`;

const logger = createLogger("fetchAppPermissions");

export async function fetchAppPermissions(client: Client): Promise<PermissionEnum[]> {
  const { error, data } = await client
    .query<FetchAppPermissionsQuery>(FetchAppPermissionsDocument, {})
    .toPromise();

  if (error) {
    logger.error("Error fetching app permissions", { error });
    throw new Error("Could not fetch the app permissions");
  }

  return data?.app?.permissions?.map((p) => p.code) || [];
}
