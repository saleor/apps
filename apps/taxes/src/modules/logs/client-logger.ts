import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";
import { z } from "zod";
import { createSettingsManager } from "../app/metadata-manager";
import {
  ClientLogsMetadataRepository,
  ClientLogsMetadataRepositoryParams,
  MetadataLogs,
} from "./client-logs-metadata-repository";

const clientLogSchema = z.object({
  date: z.string(),
  event: z.string(),
  status: z.enum(["success", "error"]),
  payload: z.string().optional(),
});

export const clientLogInputSchema = clientLogSchema.pick({ event: true, status: true }).merge(
  z.object({
    payload: z
      .object({
        input: z.unknown(),
        output: z.unknown(),
      })
      .optional(),
  }),
);

type LogInput = z.infer<typeof clientLogInputSchema>;

export type ClientLog = z.infer<typeof clientLogSchema>;

export const LOG_LIMIT = 10;

export class ClientLogger implements MetadataLogs<ClientLog> {
  private logRepository: ClientLogsMetadataRepository<ClientLog>;

  constructor({
    settingsManager,
    configurationId,
  }: Pick<ClientLogsMetadataRepositoryParams<ClientLog>, "settingsManager"> & {
    configurationId: string;
  }) {
    this.logRepository = new ClientLogsMetadataRepository({
      metadataKey: `logs-${configurationId}`,
      schema: clientLogSchema,
      settingsManager,
      options: {
        limit: LOG_LIMIT,
      },
    });
  }

  getAll() {
    return this.logRepository.getAll();
  }

  push({ event, payload, status }: LogInput) {
    const log: ClientLog = {
      date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      event,
      payload: JSON.stringify(payload, null, 4),
      status,
    };

    return this.logRepository.push(log);
  }
}

export function createClientLogger({
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

  return new ClientLogger({
    settingsManager,
    configurationId,
  });
}
