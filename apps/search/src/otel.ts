import { trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
const { PinoInstrumentation } = require("@opentelemetry/instrumentation-pino");

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "saleor.app.search",
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  instrumentations: [
    new PinoInstrumentation({
      // Optional hook to insert additional context to log object.
      logHook: (span, record, level) => {
        record["resource.service.name"] = "saleor.app.search";
      },
    }),
    // other instrumentations
  ],
});

sdk.start();

export const tracer = trace.getTracer("saleor.app.search");
