import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { InfoTooltip } from "./info-tooltip";

describe("InfoTooltip", () => {
  it("names what it explains for screen readers", () => {
    render(
      <InfoTooltip label="About order notifications" data-test-id="note">
        These can all fire for one order.
      </InfoTooltip>,
    );

    expect(screen.getByRole("button", { name: "About order notifications" })).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  /* Hover is not the only way in: keyboard users have to reach the note too. */
  it("shows the note when the glyph takes focus", async () => {
    render(
      <InfoTooltip label="About order notifications" data-test-id="note">
        These can all fire for one order.
      </InfoTooltip>,
    );

    await userEvent.tab();

    expect(screen.getByTestId("note")).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "These can all fire for one order.",
    );
  });
});
