import { appWebhooks } from "../../../webhooks";

interface isWebhookUpdateNeededArgs {
  existingWebhookNames: string[];
}

export const isWebhookUpdateNeeded = ({ existingWebhookNames }: isWebhookUpdateNeededArgs) => {
  const notInstalledWebhooks = appWebhooks.filter((w) => !existingWebhookNames.includes(w.name));

  return !!notInstalledWebhooks.length;
};
