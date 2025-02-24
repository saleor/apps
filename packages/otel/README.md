# @saleor/apps-otel

Shared package with [Open Telemetry](https://opentelemetry.io/) (OTEL) related helpers.

## Running app with OTEL locally

1. Make sure you have OTEL collector running (either locally or in the internet).

2. Add those env variables to `.env` file for given app:

```
OTEL_SERVICE_NAME=saleor-app- # name of the app - the same as in package.json
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 # OTEL collector endpoint
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=1 # Otherwise you won't see all traces
NEXT_RUNTIME=nodejs
```

> [!IMPORTANT]
> We change default sampler to be [`TraceIDRatioBasedSampler`](https://opentelemetry.io/docs/languages/js/sampling/#traceidratiobasedsampler) so you can see all request in collector. In production apps are using [`parentbased_always_on`](https://opentelemetry.io/docs/languages/sdk-configuration/general/#otel_traces_sampler) sampler meaning parent span (coming from Saleor) is deciding if span is sampled or not.

3. Run app e.g via `pnpm run dev`

## Writing your own sampler

Alternatively to setting `OTEL_TRACES_SAMPLER` variable you can write your own sampler that samples all spans:

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
