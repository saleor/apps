import { ROOT_CONTEXT, SpanKind, trace, TraceFlags } from "@opentelemetry/api";
import { SamplingDecision } from "@opentelemetry/sdk-trace-node";
import { describe, expect, it } from "vitest";

import { DeferredSampler, SALEOR_SAMPLING_DECISION_ATTR } from "./deferred-sampler";

describe("DeferredSampler", () => {
  const traceId = "0af7651916cd43dd8448eb211c80319c";
  const spanName = "test-span";
  const spanKind = SpanKind.SERVER;
  const attributes = {};
  const links: never[] = [];

  describe("when parent is sampled", () => {
    it("should return RECORD_AND_SAMPLED decision", () => {
      const sampler = new DeferredSampler();
      const parentContext = trace.setSpanContext(ROOT_CONTEXT, {
        traceId,
        spanId: "b7ad6b7169203331",
        traceFlags: TraceFlags.SAMPLED,
        isRemote: true,
      });

      const result = sampler.shouldSample(
        parentContext,
        traceId,
        spanName,
        spanKind,
        attributes,
        links,
      );

      expect(result.decision).toBe(SamplingDecision.RECORD_AND_SAMPLED);
      expect(result.attributes?.[SALEOR_SAMPLING_DECISION_ATTR]).toBe("sampled");
    });
  });

  describe("when parent is not sampled", () => {
    it("should return RECORD decision (defer to TailSamplingProcessor)", () => {
      const sampler = new DeferredSampler();
      const parentContext = trace.setSpanContext(ROOT_CONTEXT, {
        traceId,
        spanId: "b7ad6b7169203331",
        traceFlags: TraceFlags.NONE,
        isRemote: true,
      });

      const result = sampler.shouldSample(
        parentContext,
        traceId,
        spanName,
        spanKind,
        attributes,
        links,
      );

      expect(result.decision).toBe(SamplingDecision.RECORD);
      expect(result.attributes?.[SALEOR_SAMPLING_DECISION_ATTR]).toBe("not_sampled");
    });
  });

  describe("when there is no parent (root span)", () => {
    it("should return RECORD decision (defer to TailSamplingProcessor)", () => {
      const sampler = new DeferredSampler();

      const result = sampler.shouldSample(
        ROOT_CONTEXT,
        traceId,
        spanName,
        spanKind,
        attributes,
        links,
      );

      expect(result.decision).toBe(SamplingDecision.RECORD);
      expect(result.attributes?.[SALEOR_SAMPLING_DECISION_ATTR]).toBe("none");
    });
  });

  describe("toString", () => {
    it("should return descriptive string", () => {
      const sampler = new DeferredSampler();

      expect(sampler.toString()).toBe("DeferredSampler");
    });
  });
});
