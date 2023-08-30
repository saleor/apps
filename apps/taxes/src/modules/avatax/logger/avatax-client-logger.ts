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
  payload: z.unknown().optional(),
});

export const logInputSchema = logSchema.pick({ event: true, status: true }).merge(
  z.object({
    payload: z.unknown(),
  }),
);

type AvataxLogInput = z.infer<typeof logInputSchema>;

type AvataxLog = z.infer<typeof logSchema>;

const AVATAX_LOG_LIMIT = 100;

export class AvataxClientLogger implements MetadataLogs<AvataxLog> {
  private logRepository: ClientLogsMetadataRepository<AvataxLog>;

  constructor({
    settingsManager,
  }: Pick<ClientLogsMetadataRepositoryParams<AvataxLog>, "settingsManager">) {
    this.logRepository = new ClientLogsMetadataRepository({
      metadataKey: "avatax-logs",
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
      payload,
      status,
    };

    return this.logRepository.push(log);
  }
}
