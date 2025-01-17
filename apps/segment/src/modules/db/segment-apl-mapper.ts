import { AuthData } from "@saleor/app-sdk/APL";
import { FormattedItem, type PutItemInput } from "dynamodb-toolbox";

import { SegmentAPLEntityType, SegmentMainTable } from "@/modules/db/segment-main-table";

export class SegmentAPLMapper {
  dynamoDBEntityToAuthData(entity: FormattedItem<SegmentAPLEntityType>): AuthData {
    return {
      domain: entity.domain,
      token: entity.token,
      saleorApiUrl: entity.saleorApiUrl,
      appId: entity.appId,
      jwks: entity.jwks,
    };
  }

  authDataToDynamoPutEntity(authData: AuthData): PutItemInput<SegmentAPLEntityType> {
    return {
      PK: SegmentMainTable.getAPLPrimaryKey({ saleorApiUrl: authData.saleorApiUrl }),
      SK: SegmentMainTable.getAPLSortKey(),
      domain: authData.domain,
      token: authData.token,
      saleorApiUrl: authData.saleorApiUrl,
      appId: authData.appId,
      jwks: authData.jwks,
    };
  }
}
