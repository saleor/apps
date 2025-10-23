# @saleor/apps-otel

Shared package with [Open Telemetry](https://opentelemetry.io/) (OTEL) related helpers.

## Running app with OTEL locally

1. Make sure you have an OTEL collector running (either locally or on the internet).

2. Add these env variables to the `.env` file for the given app:

```
OTEL_SERVICE_NAME=saleor-app- # name of the app - the same as in package.json
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 # OTEL collector endpoint (http protocol)
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=1 # Otherwise you won't see all traces
OTEL_ACCESS_TOKEN=token
```

> [!IMPORTANT]
> We change the default sampler to be [`TraceIDRatioBasedSampler`](https://opentelemetry.io/docs/languages/js/sampling/#traceidratiobasedsampler) so you can see all requests in the collector. In production, apps are using the [`parentbased_always_on`](https://opentelemetry.io/docs/languages/sdk-configuration/general/#otel_traces_sampler) sampler, meaning the parent span (coming from Saleor) decides if a span is sampled or not.

3. Run the app, e.g., via `pnpm run dev`

## Writing your own sampler

Alternatively to setting the `OTEL_TRACES_SAMPLER` variable, you can write your own sampler that samples all spans:

```ts
import { Context, Sampler, SamplingResult, SpanKind } from "@opentelemetry/api";

export class OTELSampler implements Sampler {
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
  ): SamplingResult {
    return { decision: 2 };
  }

  toString(): string {
    return "OTELSampler";
  }
}
```

Then use it while initializing NodeSDK in `otel-instrumentation.node.ts`:

```ts
const sdk = new NodeSDK({
  // rest of the config
  sampler: new OTELSampler(),
});

sdk.start();
```

## Debugging OTEL

If you need to debug OTEL configuration add this environment variable to your app `.env` file:

```
OTEL_LOG_LEVEL=debug
```

Other possible values of `OTEL_LOG_LEVEL` are:

- none
- error
- warn
- info (default)
