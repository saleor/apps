import { router } from "./trpc-server";

export const trpcRouter = router({});

export type TrpcRouter = typeof trpcRouter;
