import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { trace } from "@opentelemetry/api";

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "saleor.app.search",
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
});

sdk.start();

export const tracer = trace.getTracer("saleor.app.search");
