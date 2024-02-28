import { z } from "zod";
import { avataxConnectionSchema } from "../avatax/avatax-connection-schema";
import { ChannelsConfig } from "../channel-configuration/channel-config";

export const providerConnectionSchema = avataxConnectionSchema;

export const providerConnectionsSchema = z.array(providerConnectionSchema);

export type ProviderConnections = z.infer<typeof providerConnectionsSchema>;
export type ProviderConnection = z.infer<typeof providerConnectionSchema>;
export type ProviderName = ProviderConnection["provider"];

export type AppConfig = {
  providerConnections: ProviderConnections;
  channels: ChannelsConfig;
};
