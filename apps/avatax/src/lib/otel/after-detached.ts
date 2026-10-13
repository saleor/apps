import { context, ROOT_CONTEXT } from "@opentelemetry/api";
import { after } from "next/server";

// Runs fn after the response in a fresh trace: @vercel/otel force-ends spans still open when the request trace ends
export const afterDetached = (fn: () => unknown) => after(() => context.with(ROOT_CONTEXT, fn));
