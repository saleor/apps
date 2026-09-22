import "@testing-library/jest-dom/vitest";

import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

configure({ testIdAttribute: "data-test-id" });

/*
 * jsdom has no ResizeObserver, and macaw's floating components (tooltip, popover) measure themselves
 * with one as soon as they open. Observing nothing is enough: the assertions are about what the
 * component renders, not where it lands.
 */
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  cleanup();
});
