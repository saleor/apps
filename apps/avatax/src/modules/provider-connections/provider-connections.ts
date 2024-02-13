import { z } from "zod";
import { avataxConnectionSchema } from "../avatax/avatax-connection-schema";
import { taxJarConnection } from "../taxjar/taxjar-connection-schema";

export const providerConnectionSchema = taxJarConnection.or(avataxConnectionSchema);

export const providerConnectionsSchema = z.array(providerConnectionSchema);

export type ProviderConnections = z.infer<typeof providerConnectionsSchema>;
export type ProviderConnection = z.infer<typeof providerConnectionSchema>;
export type ProviderName = ProviderConnection["provider"];
