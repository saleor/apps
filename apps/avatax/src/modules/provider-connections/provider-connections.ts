import { z } from "zod";
import { avataxConnectionSchema } from "../avatax/avatax-connection-schema";

export const providerConnectionSchema = avataxConnectionSchema;

export const providerConnectionsSchema = z.array(providerConnectionSchema);

export type ProviderConnections = z.infer<typeof providerConnectionsSchema>;
export type ProviderConnection = z.infer<typeof providerConnectionSchema>;
export type ProviderName = ProviderConnection["provider"];
