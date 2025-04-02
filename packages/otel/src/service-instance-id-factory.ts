import { v4 as uuidv4 } from "uuid";

// https://opentelemetry.io/docs/specs/semconv/attributes-registry/service/#service-instance-id
export const createServiceInstanceId = () => uuidv4();
