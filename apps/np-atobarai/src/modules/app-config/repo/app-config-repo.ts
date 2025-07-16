import { Encryptor } from "@saleor/apps-shared/encryptor";
import { createDynamoConfigRepository } from "@saleor/dynamo-config-repository";

import { env } from "@/lib/env";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { appConfigEntity, appConfigSchema } from "@/modules/app-config/repo/dynamodb/entity";
import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";
import { dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

const encryptor = new Encryptor(env.SECRET_KEY);

export const appConfigRepo = createDynamoConfigRepository<
  AppChannelConfig,
  typeof appConfigEntity,
  typeof appConfigSchema
>({
  table: dynamoMainTable,
  mapping: {
    singleDynamoItemToDomainEntity(item) {
      const result = AppChannelConfig.create({
        id: item.configId,
        fillMissingAddress: item.fillMissingAddress,
        merchantCode: createAtobaraiMerchantCode(item.merchantCode),
        name: item.configName,
        shippingCompanyCode: item.shippingCompanyCode,
        skuAsName: item.skuAsName,
        spCode: createAtobaraiSpCode(encryptor.decrypt(item.spCode)),
        terminalId: createAtobaraiTerminalId(item.terminalId),
        useSandbox: item.useSandbox,
      });

      if (result.isErr()) {
        throw new Error("Failed to parse database model to domain model", {
          cause: result.error,
        });
      }

      return result.value;
    },
    singleDomainEntityToDynamoItem(entity) {
      return {
        configId: entity.id,
        configName: entity.name,
        fillMissingAddress: entity.fillMissingAddress,
        merchantCode: entity.merchantCode,
        shippingCompanyCode: entity.shippingCompanyCode,
        skuAsName: entity.skuAsName,
        spCode: encryptor.encrypt(entity.spCode),
        terminalId: entity.terminalId,
        useSandbox: entity.useSandbox,
      };
    },
  },
  configItem: {
    toolboxEntity: appConfigEntity,
    entitySchema: appConfigSchema,
    idAttr: "configId",
  },
});

export type AppConfigRepo = Omit<typeof appConfigRepo, "mappingEntity">;
