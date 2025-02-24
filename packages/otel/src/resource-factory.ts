import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export const createResource = (args: {
  serviceName: string | undefined;
  serviceVersion: string;
  serviceEnviroment: string | undefined;
  serviceCommitSha: string | undefined;
}) => {
  return new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: args.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: args.serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: args.serviceEnviroment,
    "commit-sha": args.serviceCommitSha,
  });
};
