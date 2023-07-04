import { protectedClientProcedure } from "./protected-client-procedure";
import { router } from "./trpc-server";

export const appRouter = router({
  foo: router({
    get: protectedClientProcedure.query(() => {
      console.log("asd");

      return "asd";
    }),
  }),
});

export type AppRouter = typeof appRouter;
