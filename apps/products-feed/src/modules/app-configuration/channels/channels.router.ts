import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { ChannelsFetcher } from "./channels-fetcher";
import { ChannelFragment } from "../../../../generated/graphql";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(
    async ({ ctx: { logger, apiClient }, input }): Promise<ChannelFragment[]> => {
      const fetcher = new ChannelsFetcher(apiClient);

      logger.debug("Will fetch channels");

      return fetcher.fetchChannels().then((channels) => channels ?? []);
    }
  ),
});
