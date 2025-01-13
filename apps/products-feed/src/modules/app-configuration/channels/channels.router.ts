import { ChannelFragment } from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";
import { ChannelsFetcher } from "./channels-fetcher";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(
    async ({ ctx: { apiClient } }): Promise<ChannelFragment[]> => {
      const logger = createLogger("channelsRouter.fetch");

      const fetcher = new ChannelsFetcher(apiClient);

      logger.debug("Fetching channels");

      const channels = await fetcher.fetchChannels().then((channels) => channels ?? []);

      logger.debug("Channels fetched successfully", {
        first: channels[0],
        totalLength: channels.length,
      });

      return channels;
    },
  ),
});
