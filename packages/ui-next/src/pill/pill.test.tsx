import { ThemeProvider } from "@saleor/macaw-ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Pill } from "./pill";

const renderPill = (ui: ReactNode) =>
  render(<ThemeProvider defaultTheme="defaultLight">{ui}</ThemeProvider>);

describe("Pill", () => {
  it("renders a capsule labelled with the children, defaulting to neutral", () => {
    renderPill(<Pill data-test-id="pill">Storefront</Pill>);

    const pill = screen.getByTestId("pill");

    expect(pill).toHaveTextContent("Storefront");
    expect(pill).toHaveAttribute("data-tone", "neutral");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the explanation when the pill takes focus", async () => {
    renderPill(
      <Pill tone="info" data-test-id="pill" tooltip="This environment serves preview URLs.">
        Preview
      </Pill>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.tab();

    expect(screen.getByTestId("pill")).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "This environment serves preview URLs.",
    );
  });
});
