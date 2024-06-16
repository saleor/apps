import { AuthData } from "@saleor/app-sdk/APL";
import { AppConfigMetadataManager, RootConfig } from "../configuration";
import { createLogger } from "@/logger";

export type WebhookContext = Pick<RootConfig.Shape, "connections" | "providers">;

const logger = createLogger("createWebhookConfigContext");

export const createWebhookConfigContext = async ({
  authData,
}: {
  authData: AuthData;
}): Promise<WebhookContext> => {
  logger.trace("Creating webhook config context");
  const configManager = AppConfigMetadataManager.createFromAuthData(authData);
  const appConfig = await configManager.get();

  const providers = appConfig.providers.getProviders();
  const connections = appConfig.connections.getConnections();

  logger.trace("Webhook config context created", {
    providersIds: providers.map((p) => p.id),
    connectionsIds: connections.map((c) => c.id),
  });

  return {
    providers,
    connections,
  };
};
