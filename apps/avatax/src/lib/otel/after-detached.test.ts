// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { trace } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { after } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { afterDetached } from "./after-detached";

vi.mock("next/server", () => ({ after: vi.fn() }));

describe("afterDetached", () => {
  it("Runs the deferred callback outside of the request trace", () => {
    const provider = new NodeTracerProvider();

    provider.register();
    const tracer = provider.getTracer("test");
    const fn = vi.fn(() => trace.getActiveSpan());

    tracer.startActiveSpan("request", (span) => {
      afterDetached(fn);
      span.end();
    });

    const [task] = vi.mocked(after).mock.calls[0];

    (task as () => unknown)();

    expect(fn).toHaveBeenCalled();
    expect(fn.mock.results[0].value).toBeUndefined();
  });
});
