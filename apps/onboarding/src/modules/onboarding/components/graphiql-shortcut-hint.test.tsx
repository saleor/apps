import { configure, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GraphiqlShortcutHint } from "./graphiql-shortcut-hint";

configure({ testIdAttribute: "data-test-id" });

describe("GraphiqlShortcutHint", () => {
  it("renders GraphiQL copy and a Dashboard-style keyboard shortcut", () => {
    render(<GraphiqlShortcutHint />);

    expect(screen.getByTestId("store-readiness-graphiql").textContent).toMatch(/playground/);
    expect(screen.getByTestId("store-readiness-graphiql").textContent).toMatch(/Open in GraphiQL/);
    expect(screen.getByTestId("store-readiness-graphiql-shortcut").textContent).toMatch(
      /⌘ \+ '|Ctrl \+ '/,
    );
  });
});
