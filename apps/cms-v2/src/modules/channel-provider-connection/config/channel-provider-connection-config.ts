import { generateId } from "@/modules/shared/generate-id";
import { z } from "zod";

/**
 * Schemas
 */
const ConnectionSchemaInput = z.object({
  channelSlug: z.string(), // todo maybe channel ID
  providerId: z.string(),
  providerType: z.enum(["contentful"]), // todo extract enum to shared
});

const ConnectionSchema = ConnectionSchemaInput.extend({
  id: z.string(),
});

const ChannelProviderConnectionRootConfig = z.object({
  connections: z.array(ConnectionSchema),
});

export const ChannelProviderConnectionConfigSchema = {
  NewConnectionInput: ConnectionSchemaInput,
  Connection: ConnectionSchema,
  Root: ChannelProviderConnectionRootConfig,
};

/**
 * Types
 */
export type RootSchemaType = z.infer<typeof ChannelProviderConnectionRootConfig>;
export type ConnectionSchemaInputType = z.infer<typeof ConnectionSchemaInput>;

export class ChannelProviderConnectionConfig {
  private rootData: RootSchemaType = {
    connections: [],
  };

  constructor(initialData?: RootSchemaType) {
    if (initialData) {
      this.rootData = ChannelProviderConnectionRootConfig.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new ChannelProviderConnectionConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  getConnections() {
    return this.rootData.connections;
  }

  deleteConnection(connectionID: string) {
    this.rootData.connections = this.rootData.connections.filter((c) => c.id !== connectionID);

    return this;
  }

  addConnection(input: ConnectionSchemaInputType) {
    const parsed = ConnectionSchemaInput.parse(input);

    this.rootData.connections.push({
      ...parsed,
      id: generateId(),
    });

    return this;
  }
}
