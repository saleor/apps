import { z } from "zod";
import {
  MetadataLogs,
  ClientLogsMetadataRepository,
  ClientLogsMetadataRepositoryParams,
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

type AvataxLogInput = z.infer<typeof logInputSchema>;

export type AvataxLog = z.infer<typeof logSchema>;

const AVATAX_LOG_LIMIT = 100;

export class AvataxClientLogger implements MetadataLogs<AvataxLog> {
  private logRepository: ClientLogsMetadataRepository<AvataxLog>;

  constructor({
    settingsManager,
    configurationId,
  }: Pick<ClientLogsMetadataRepositoryParams<AvataxLog>, "settingsManager"> & {
    configurationId: string;
  }) {
    this.logRepository = new ClientLogsMetadataRepository({
      metadataKey: configurationId,
      schema: logSchema,
      settingsManager,
      options: {
        limit: AVATAX_LOG_LIMIT,
      },
    });
  }

  getAll() {
    return this.logRepository.getAll();
  }

  push({ event, payload, status }: AvataxLogInput) {
    const log: AvataxLog = {
      date: new Date().toDateString(),
      event,
      payload: JSON.stringify(payload, null, 4),
      status,
    };

    return this.logRepository.push(log);
  }
}
