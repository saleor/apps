import { z } from "zod";
import { test } from "vitest";
import { EncryptedMetadataManager, SettingsManager } from "@saleor/app-sdk/settings-manager";

const AddressSchema = z.object({
  companyName: z.string(),
  cityArea: z.string(),
  countryArea: z.string(),
  streetAddress1: z.string(),
  streetAddress2: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

const ChannelSchema = z.object({
  slug: z.string().min(1),
});

const AddressOverrideSchema = z.object({
  address: AddressSchema,
  channel: ChannelSchema,
});

const RootConfigSchema = z.object({
  overrides: z.record(AddressOverrideSchema),
});

/**
 * Root model that can serialize to json and parse from json.
 *
 * Uses Zod to parse and validate
 *
 * Adds domain methods on top
 */
export class ConfigModel {
  /**
   * Stores its own data as deep, single json, structured and validated by zod
   */
  private rootData: z.infer<typeof RootConfigSchema> = { overrides: {} };

  constructor(initialConfig?: z.infer<typeof RootConfigSchema>) {
    /**
     * Sets its own initial state but also allows to inject - then validate
     */
    if (initialConfig) {
      this.rootData = RootConfigSchema.parse(initialConfig);
    }
  }

  /**
   * Can statically parse itself, ensures parse/serialize work together
   */
  static parse(serialized: string) {
    return new ConfigModel(RootConfigSchema.parse(JSON.parse(serialized)));
  }

  /**
   * Serializes to json, even if some extra methods are saved (can be replaced/cleaned up if needed),
   * zod will remove unknown members after parsing
   */
  serialize() {
    return JSON.stringify(this.rootData);
  }

  /**
   * Domain methods needed by app
   */
  getOverridesArray() {
    return Object.values(this.rootData.overrides);
  }

  /**
   * Domain methods needed by app
   */
  isChannelOverridden(slug: string) {
    return Boolean(this.rootData.overrides[slug]);
  }

  /**
   * Domain methods needed by app
   */
  addOverride(slug: string, address: z.infer<typeof AddressSchema>) {
    /**
     * Perform additional checks, for example implement "update" method and forbid to implicit override
     */
    if (this.rootData.overrides[slug]) {
      throw new Error("Channel override already exists");
    }

    /**
     * Ensure input is correct. Use "satisfied" because zod accepts "unknown"
     */
    this.rootData.overrides[slug] = AddressOverrideSchema.parse({
      channel: {
        slug: slug,
      },
      address: address,
    } satisfies z.infer<typeof AddressOverrideSchema>);

    /**
     * Return this to allow chaining, optional
     */
    return this;
  }

  /**
   * Domain methods needed by app
   */
  removeOverride(slug: string) {
    delete this.rootData.overrides[slug];

    return this;
  }
}

/**
 * model can be connected with MetadataManager to automatically fetch and parse data.
 *
 * So for app usage this can be the only "root source" used
 */
abstract class ConfigManager {
  /**
   * Uses metadata manager to read/write
   */
  abstract metadataManager: SettingsManager;

  /**
   * Can fetch config and parse it to domain model
   */
  abstract loadConfig(): Promise<ConfigModel>;

  /**
   * Can serialize and  save config in metadata
   */
  abstract saveConfig(config: ConfigModel): Promise<void>;
}
