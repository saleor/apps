import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";

export const createAwsInstrumentation = () => {
  return new AwsInstrumentation({
    // disable http instrumentation for aws-sdk operations so that we don't create duplicate spans
    suppressInternalInstrumentation: true,
  });
};
