import { ILogObj, Logger as TSLogger } from "tslog";

export { attachLoggerConsoleTransport } from "./src/logger-console-transport";
export { attachLoggerVercelBuildtimeTransport } from "./src/logger-vercel-buildtime-transport";
export { rootLogger } from "./src/root-logger";

export type Logger = TSLogger<ILogObj>;
