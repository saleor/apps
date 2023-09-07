import { createLogger } from "@saleor/apps-shared";
import { router } from "../trpc/trpc-server";

const logger = createLogger({ name: "configuration.router" });

export const configurationRouter = router({});
