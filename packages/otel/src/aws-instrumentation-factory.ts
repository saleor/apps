import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";

export const createAwsInstrumentation = () => {
  return new AwsInstrumentation({
    suppressInternalInstrumentation: true,
  });
};
