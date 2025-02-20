/* eslint-disable max-params */
import { Context, Sampler, SamplingResult, SpanKind } from "@opentelemetry/api";

// TODO: remove after testing
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
