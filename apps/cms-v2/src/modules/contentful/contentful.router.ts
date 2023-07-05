import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";

export const contentfulRouter = router({
  fetchConfiguration: protectedClientProcedure.query(() => {}),
  setConfiguration: protectedClientProcedure.mutation(({ input, ctx }) => {}),
});
