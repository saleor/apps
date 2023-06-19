import { ChannelsFetcher } from "./channels-fetcher";
import { createGraphQLClient } from "@saleor/apps-shared";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

export const channelsRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx }) => {
    const client = createGraphQLClient({ saleorApiUrl: ctx.saleorApiUrl, token: ctx.token });

    const fetcher = new ChannelsFetcher(client);

    return await fetcher.fetchChannels().then((channels) => channels ?? []);
  }),
});
