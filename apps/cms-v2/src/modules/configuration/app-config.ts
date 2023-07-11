import { generateId } from "../shared/generate-id";
import {
  ChannelProviderConnectionConfigSchema,
  ChannelProviderConnectionInputType,
} from "./schemas/channel-provider-connection.schema";
import { ContentfulProviderSchema } from "./schemas/contentful-provider.schema";
import { DatocmsProviderSchema } from "./schemas/datocms-provider.schema";
import {
  AnyProviderConfigSchemaType,
  AnyProviderInputSchemaType,
  RootConfigSchema,
  RootConfigSchemaType,
} from "./schemas/root-config.schema";

/**
 * TODO
 * - test
 * - extract and delegate smaller configs?
 */
export class AppConfig {
  private rootData: RootConfigSchemaType = {
    providers: [],
    connections: [],
  };

  constructor(initialData?: RootConfigSchemaType) {
    if (initialData) {
      this.rootData = RootConfigSchema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  private getProviderInputSchema(input: AnyProviderInputSchemaType) {
    switch (input.type) {
      case "contentful":
        return ContentfulProviderSchema.ConfigInput;
      case "datocms":
        return DatocmsProviderSchema.ConfigInput;
    }
  }

  private getProviderSchema(input: AnyProviderConfigSchemaType) {
    switch (input.type) {
      case "contentful":
        return ContentfulProviderSchema.Config;
      case "datocms":
        return DatocmsProviderSchema.Config;
    }
  }

  providers = {
    checkProviderExists: (id: string) => {
      return !!this.rootData.providers.find((p) => p.id === id);
    },

    addProvider: (providerConfigInput: AnyProviderInputSchemaType) => {
      const inputSchema = this.getProviderInputSchema(providerConfigInput);

      const parsedConfig = inputSchema.parse(providerConfigInput);

      this.rootData.providers.push({
        ...parsedConfig,
        id: generateId(),
      });

      return this;
    },

    updateProvider: (providerConfig: AnyProviderConfigSchemaType) => {
      const schema = this.getProviderSchema(providerConfig);

      const parsedConfig = schema.parse(providerConfig);

      this.rootData.providers = this.rootData.providers.map((p) => {
        if (p.id === parsedConfig.id) {
          return parsedConfig;
        } else {
          return p;
        }
      });
    },

    deleteProvider: (id: string) => {
      this.rootData.providers = this.rootData.providers.filter((p) => p.id !== id);
      this.connections.deleteConnectionsWithProvider(id);

      return this;
    },

    getProviders: () => {
      return this.rootData.providers;
    },

    getProviderById: (id: string) => {
      return this.providers.getProviders().find((p) => p.id === id);
    },
  };

  connections = {
    getConnections: () => {
      return this.rootData.connections;
    },

    deleteConnection: (connectionID: string) => {
      this.rootData.connections = this.rootData.connections.filter((c) => c.id !== connectionID);

      return this;
    },

    addConnection: (input: ChannelProviderConnectionInputType) => {
      if (!this.providers.checkProviderExists(input.providerId)) {
        throw new Error("Provider doesnt exist");
      }

      const parsed = ChannelProviderConnectionConfigSchema.Connection.parse({
        ...input,
        id: generateId(),
      });

      this.rootData.connections.push(parsed);

      return this;
    },

    deleteConnectionsWithProvider: (providerId: string) => {
      this.rootData.connections = this.rootData.connections.filter((conn) => {
        return conn.providerId !== providerId;
      });
    },

    getConnectionById: (id: string) => {
      return this.connections.getConnections().find((c) => c.id === id);
    },
  };
}
