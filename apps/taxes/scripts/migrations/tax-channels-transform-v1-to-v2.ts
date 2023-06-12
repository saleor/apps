import { createId } from "../../src/lib/utils";
import { ChannelsV1 } from "./channels-config-schema-v1";
import { ChannelsV2 } from "./channels-config-schema-v2";

export class TaxChannelsTransformV1toV2 {
  transform(channels: ChannelsV1): ChannelsV2 {
    return Object.keys(channels).map((slug) => {
      const channel = channels[slug];

      return {
        // * There was no id in v1, so we need to generate it
        id: createId(),
        config: {
          providerConnectionId: channel.providerInstanceId,
          slug,
        },
      };
    });
  }
}
