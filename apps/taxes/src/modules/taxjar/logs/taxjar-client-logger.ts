import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";
import { z } from "zod";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  ClientLogsMetadataRepository,
  ClientLogsMetadataRepositoryParams,
  MetadataLogs,
} from "../../logs/client-logs-metadata-repository";

const logSchema = z.object({
  date: z.string(),
  event: z.string(),
  status: z.enum(["success", "error"]),
  payload: z.string().optional(),
});

export const logInputSchema = logSchema.pick({ event: true, status: true }).merge(
  z.object({
    payload: z
      .object({
        input: z.unknown(),
        output: z.unknown(),
      })
      .optional(),
  }),
);

type TaxJarLogInput = z.infer<typeof logInputSchema>;

export type TaxJarLog = z.infer<typeof logSchema>;

export const TAXJAR_LOG_LIMIT = 100;

export class TaxJarClientLogger implements MetadataLogs<TaxJarLog> {
  private logRepository: ClientLogsMetadataRepository<TaxJarLog>;

  constructor({
    settingsManager,
    configurationId,
  }: Pick<ClientLogsMetadataRepositoryParams<TaxJarLog>, "settingsManager"> & {
    configurationId: string;
  }) {
    this.logRepository = new ClientLogsMetadataRepository({
      metadataKey: `logs-${configurationId}`,
      schema: logSchema,
      settingsManager,
      options: {
        limit: TAXJAR_LOG_LIMIT,
      },
    });
  }

  getAll() {
    return this.logRepository.getAll();
  }

  push({ event, payload, status }: TaxJarLogInput) {
    const log: TaxJarLog = {
      date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      event,
      payload: JSON.stringify(payload, null, 4),
      status,
    };

    return this.logRepository.push(log);
  }
}

export function createTaxJarClientLogger({
  authData,
  configurationId,
}: {
  authData: AuthData;
  configurationId: string;
}) {
  const { appId, saleorApiUrl, token } = authData;
  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });
  const settingsManager = createSettingsManager(client, appId);

  return new TaxJarClientLogger({
    settingsManager,
    configurationId,
  });
}
