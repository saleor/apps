import { router } from "./trpc-server";

export const appRouter = router({});

export type AppRouter = typeof appRouter;
