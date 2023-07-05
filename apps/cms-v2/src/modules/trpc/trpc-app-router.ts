import { contentfulRouter } from "../contentful/contentful.router";
import { protectedClientProcedure } from "./protected-client-procedure";
import { router } from "./trpc-server";

export const appRouter = router({
  contentful: contentfulRouter,
});

export type AppRouter = typeof appRouter;
