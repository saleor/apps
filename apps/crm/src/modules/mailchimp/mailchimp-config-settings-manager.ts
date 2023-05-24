import { Client } from "urql";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { createLogger } from "@saleor/apps-shared";

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

export interface IMailchimpConfigSettingsManagerV1 {
  getConfig(): Promise<z.infer<typeof ConfigV1> | null>;
}

/**
 * V1 config. In case of changing config, create another instance and perform migration
 *
 * todo save domain?
 */
export class MailchimpConfigSettingsManagerV1 implements IMailchimpConfigSettingsManagerV1 {
  private settingsManager: SettingsManager;
  private readonly metadataKey = "mailchimp_config_v1";
  private logger = createLogger({
    context: "MailchimpConfigSettingsManagerV1",
  });

  constructor(
    private apiClient: Pick<Client, "query" | "mutation">,
    private appId: string,
    metadataManagerFactory = createSettingsManager
  ) {
    this.settingsManager = metadataManagerFactory(apiClient, appId);
  }

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
    this.logger.debug(`Will fetch metadata key: ${this.metadataKey}`);

    const rawMetadata = await this.settingsManager.get(this.metadataKey);

    this.logger.debug({ rawMetadata }, "Received raw metadata");

    if (!rawMetadata) {
      this.logger.debug("Fetched metadata does not exist, will return null");

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
      this.logger.error(e);

      return null;
    }
  }

  async removeConfig() {
    return this.settingsManager.delete(this.metadataKey);
  }
}

export const MailchimpConfigSettingsManager = MailchimpConfigSettingsManagerV1;
export const MailchimpConfig = ConfigV1;
export type MailchimpConfigType = z.infer<typeof MailchimpConfig>;
