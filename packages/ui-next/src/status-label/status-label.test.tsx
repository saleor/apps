import { ThemeProvider } from "@saleor/macaw-ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { StatusLabel } from "./status-label";

const renderLabel = (ui: ReactNode) =>
  render(<ThemeProvider defaultTheme="defaultLight">{ui}</ThemeProvider>);

describe("StatusLabel", () => {
  it("renders a dot and a label, not a button, when there is nothing to explain", () => {
    renderLabel(
      <StatusLabel tone="success" data-test-id="status">
        Ready
      </StatusLabel>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("Ready");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the explanation when the label takes focus", async () => {
    renderLabel(
      <StatusLabel tone="success" data-test-id="status" tooltip="The domain is serving this build.">
        Ready
      </StatusLabel>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.tab();

    expect(screen.getByTestId("status")).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "The domain is serving this build.",
    );
  });
});
