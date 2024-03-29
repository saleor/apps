import { avataxConnectionSchema } from "../avatax/avatax-connection-schema";
import { z } from "zod";
import { ChannelsConfig } from "../channel-configuration/channel-config";
import { AvataxTaxCodeMatches } from "../avatax/tax-code/avatax-tax-code-match-repository";

/**
 * TODO Unify single source of parsing/serialization :/
 */
const connectionRootSchema = z.array(avataxConnectionSchema);

type ConnectionRootSchema = z.infer<typeof connectionRootSchema>;

export class AppConfig {
  constructor(config: {
    connections: ConnectionRootSchema;
    channelMapping: ChannelsConfig;
    taxCodeMapping: AvataxTaxCodeMatches;
  }) {}

  // todo implement repository methods
}
