import { ThemeProvider } from "@saleor/macaw-ui";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("exposes the tone as data, not as a name — the color is the content", () => {
    const { container } = render(
      <ThemeProvider defaultTheme="defaultLight">
        <StatusDot tone="success" />
      </ThemeProvider>,
    );
    const dot = container.querySelector("[data-tone='success']");

    expect(dot).toBeInTheDocument();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });
});
