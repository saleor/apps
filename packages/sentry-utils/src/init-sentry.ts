import { extraErrorDataIntegration, init, localVariablesIntegration } from "@sentry/nextjs";

export const initSentry = (dsn: string | undefined) => {
  init({
    dsn,
    enableTracing: false,
    environment: process.env.ENV,
    includeLocalVariables: true,
    ignoreErrors: ["TRPCClientError"],
    integrations: [
      localVariablesIntegration({
        captureAllExceptions: true,
      }),
      extraErrorDataIntegration(),
    ],
  });
};
