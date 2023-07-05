import { contentfulRouter } from "../contentful/contentful.router";
import { providersListRouter } from "../providers-listing/providers-list.router";
import { protectedClientProcedure } from "./protected-client-procedure";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
  providersList: providersListRouter,
});

export type AppRouter = typeof appRouter;
