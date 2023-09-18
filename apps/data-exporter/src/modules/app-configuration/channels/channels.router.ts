import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { ChannelsFetcher } from "./channels-fetcher";
import { ChannelFragment } from "../../../../generated/graphql";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(
    async ({ ctx: { logger, apiClient } }): Promise<ChannelFragment[]> => {
      const fetcher = new ChannelsFetcher(apiClient);

      logger.debug("Fetching channels");
      const channels = fetcher.fetchChannels().then((channels) => channels ?? []);

      logger.debug("Channels fetched successfully");
      return channels;
    },
  ),
});
