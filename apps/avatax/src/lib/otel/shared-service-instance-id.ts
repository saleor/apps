import { createServiceInstanceId } from "@saleor/apps-otel/src/service-instance-id-factory";

// This app defines two OTEL resources - one for metrics and one for traces. We need to use the same id for both
export const sharedServiceInstanceId = createServiceInstanceId();
