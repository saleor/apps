import { Attributes, Context, Link, SpanKind, trace, TraceFlags } from "@opentelemetry/api";
import { Sampler, SamplingDecision, SamplingResult } from "@opentelemetry/sdk-trace-node";

/**
 * Attribute key to store Saleor's original sampling decision.
 * Used by TailSamplingProcessor to know if Saleor wanted this trace.
 */
export const SALEOR_SAMPLING_DECISION_ATTR = "saleor.sampling.decision";

/**
 * Check if SAMPLED flag is set in traceFlags bitmask.
 * Uses bitwise AND operation according to OTEL spec
 */
function isSampled(traceFlags: number): boolean {
  return (traceFlags & TraceFlags.SAMPLED) !== 0;
}

/**
 * A sampler that defers the final sampling decision to span end.
 *
 * - When parent is SAMPLED → return RECORD_AND_SAMPLED (respects parent)
 * - When parent is NOT SAMPLED or NO parent → return RECORD (defer decision to TailSamplingProcessor)
 *
 * This allows the TailSamplingProcessor to make the final decision
 * based on error status or latency at span end.
 * Without setting `RECORD` we wouldn't store any span data during runtime
 */
export class DeferredSampler implements Sampler {
  // eslint-disable-next-line @typescript-eslint/max-params -- Required by OpenTelemetry Sampler interface
  shouldSample(
    context: Context,
    _traceId: string,
    _spanName: string,
    _spanKind: SpanKind,
    _attributes: Attributes,
    _links: Link[],
  ): SamplingResult {
    const parentSpanContext = trace.getSpanContext(context);
    const parentSampled = parentSpanContext && isSampled(parentSpanContext.traceFlags);

    if (parentSampled) {
      // Parent decided to sample - we MUST sample too
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLED,
        attributes: {
          [SALEOR_SAMPLING_DECISION_ATTR]: "sampled",
        },
      };
    }

    /*
     * No parent OR parent decided NOT to sample.
     * Record span but defer export decision to TailSamplingProcessor.
     */
    return {
      decision: SamplingDecision.RECORD,
      attributes: {
        [SALEOR_SAMPLING_DECISION_ATTR]: parentSpanContext ? "not_sampled" : "none",
      },
    };
  }

  toString(): string {
    return "DeferredSampler";
  }
}
