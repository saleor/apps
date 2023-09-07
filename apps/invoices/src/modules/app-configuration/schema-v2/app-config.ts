import { AddressV2Schema, AppConfigV2Schema, AppConfigV2Shape } from "./app-config-schema.v2";
import { z } from "zod";

export class AppConfigV2 {
  private rootData: AppConfigV2Shape = { channelsOverrides: {} };

  constructor(initialData?: AppConfigV2Shape) {
    if (initialData) {
      this.rootData = AppConfigV2Schema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfigV2(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  upsertOverride(channelSlug: string, address: z.infer<typeof AddressV2Schema>) {
    const parsedAddress = AddressV2Schema.parse(address);
    /**
     * TODO Here we cant be sure if this is slug or name. Service / controller should verify it if possible
     */
    const channelSlugParsed = z.string().parse(channelSlug);

    this.rootData.channelsOverrides[channelSlugParsed] = parsedAddress;

    return this;
  }

  removeOverride(channelSlug: string) {
    const channelSlugParsed = z.string().parse(channelSlug);

    delete this.rootData.channelsOverrides[channelSlugParsed];

    return this;
  }

  getChannelsOverrides() {
    return this.rootData.channelsOverrides;
  }
}
