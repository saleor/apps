import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";

const run = async () => {
  const manager = new EncryptedMetadataManager({});
  const result = await manager.getMetadata();

  console.log(result);
};

run();
