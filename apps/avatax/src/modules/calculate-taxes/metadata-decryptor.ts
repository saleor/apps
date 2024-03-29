import { decrypt as appSdkDecrypt } from "@saleor/app-sdk/settings-manager";
import { MetadataItem } from "../../../generated/graphql";

export interface IMetadataDecryptor {
  decrypt(metadataItems: MetadataItem[]): MetadataItem[];
}

export class MetadataDecryptor implements IMetadataDecryptor {
  constructor(private secretKey: string) {}

  decrypt(metadataItems: MetadataItem[]): MetadataItem[] {
    return metadataItems.map((item) => {
      return {
        __typename: "MetadataItem",
        key: item.key,
        value: appSdkDecrypt(item.value, this.secretKey),
      };
    });
  }
}
