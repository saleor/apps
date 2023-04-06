import { Client } from "urql";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { createLogger } from "../../lib/logger";

export const CustomerCreatedEventConfig = z
  .object({
    enabled: z.literal(true),
    listId: z.string(),
  })
  .or(
    z.object({
      enabled: z.literal(false),
    })
  );

const ConfigV1 = z.object({
  token: z.string().min(1).describe("OAuth config from Mailchimp API"),
  dc: z.string().min(1).describe("Prefix for mailchimp API, received from Mailchimp metadata"),
  customerCreateEvent: CustomerCreatedEventConfig.optional(),
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
export class MailchimpConfigSettingsManagerV1 {
  private settingsManager: SettingsManager;
  private readonly metadataKey = "mailchimp_config_v1";
  private logger = createLogger({
    context: "MailchimpConfigSettingsManagerV1",
  });

  constructor(
    private apiClient: Pick<Client, "query" | "mutation">,
    metadataManagerFactory = createSettingsManager
  ) {
    this.settingsManager = metadataManagerFactory(apiClient);
  }

  private parseEmptyResponse = (value?: string) => {
    return value === "undefined" ? undefined : value;
  };

  setConfig(config: z.infer<typeof ConfigV1>) {
    const configSchema = MetadataSchemaV1.parse({
      config,
      configVersion: "v1",
    });

    if (!configSchema.config.customerCreateEvent) {
      configSchema.config.customerCreateEvent = {
        enabled: false,
      };
    }

    this.logger.debug(configSchema, "Will set config");

    return this.settingsManager.set({
      key: this.metadataKey,
      value: JSON.stringify(configSchema),
    });
  }

  async getConfig(): Promise<z.infer<typeof ConfigV1> | null> {
    this.logger.debug(`Will fetched metadata key: ${this.metadataKey}`);
    const rawMetadata = await this.settingsManager
      .get(this.metadataKey)
      .then(this.parseEmptyResponse);

    this.logger.debug({ rawMetadata }, "Received raw metadata");

    /**
     * Check for "undefined" string because after config is deleted, its actually set to "undefined" instead removing
     * TODO remove config instead setting it to "undefined"
     */
    if (!rawMetadata) {
      this.logger.debug("Raw metadata is nullable");

      return null;
    }

    try {
      const parsedMetadata = MetadataSchemaV1.parse(JSON.parse(rawMetadata));

      if (!parsedMetadata.config.customerCreateEvent) {
        parsedMetadata.config.customerCreateEvent = {
          enabled: false,
        };
      }

      return parsedMetadata.config;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async removeConfig() {
    // todo = implement settingsManager.delete
    return this.settingsManager.set({ key: this.metadataKey, value: "undefined" });
  }
}

export const MailchimpConfigSettingsManager = MailchimpConfigSettingsManagerV1;
export const MailchimpConfig = ConfigV1;
