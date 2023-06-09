import { z } from "zod";
import { channelsSchema } from "../../src/modules/channel-configuration/channel-config";

export const channelsV2Schema = channelsSchema;

export type ChannelsV2 = z.infer<typeof channelsV2Schema>;
