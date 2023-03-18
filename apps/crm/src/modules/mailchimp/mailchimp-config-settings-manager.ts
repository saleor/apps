import { Client } from "urql";
import { createSettingsManager } from "../../lib/metadata-manager";
import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { createLogger } from "../../lib/logger";

const ConfigV1 = z.object({
  token: z.string().min(1).describe("OAuth config from Mailchimp API"),
  dc: z.string().min(1).describe("Prefix for mailchimp API, received from Mailchimp metadata"),
});

const MetadataSchemaV1 = z.object({
  configVersion: z.literal("v1"),
  config: ConfigV1,
});

/**
 * V1 config. In case of changing config, create another instance and perform migration
 *
 * todo save domain?
 * todo add test
 */
class MailchimpConfigSettingsManagerV1 {
  private settingsManager: EncryptedMetadataManager;
  private readonly metadataKey = "mailchimp_config_v1";
  private logger = createLogger({
    context: "MailchimpConfigSettingsManagerV1",
  });

  constructor(private apiClient: Client) {
    this.settingsManager = createSettingsManager(apiClient);
  }

  setConfig(config: z.infer<typeof ConfigV1>) {
    const configSchema = MetadataSchemaV1.parse({
      config,
      configVersion: "v1",
    });

    this.logger.debug(configSchema, "Will set config");

    return this.settingsManager.set({
      key: this.metadataKey,
      value: JSON.stringify(configSchema),
    });
  }

  async getConfig(): Promise<z.infer<typeof ConfigV1> | null> {
    const rawMetadata = await this.settingsManager.get(this.metadataKey);

    if (!rawMetadata) {
      return null;
    }

    try {
      const parsedMetadata = MetadataSchemaV1.parse(JSON.parse(rawMetadata));

      return parsedMetadata.config;
    } catch (e) {
      return null;
    }
  }
}

export const MailchimpConfigSettingsManager = MailchimpConfigSettingsManagerV1;
export const MailchimpConfig = ConfigV1;
