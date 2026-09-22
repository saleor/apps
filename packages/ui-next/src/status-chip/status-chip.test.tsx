import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StatusChip } from "./status-chip";

describe("StatusChip", () => {
  it("renders a plain chip without a tooltip", () => {
    render(<StatusChip data-test-id="chip">Not edited yet</StatusChip>);

    expect(screen.getByTestId("chip")).toHaveTextContent("Not edited yet");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  /* Hover is not the only way in: keyboard users have to reach the explanation too. */
  it("shows the explanation when the chip takes focus", async () => {
    render(
      <StatusChip data-test-id="chip" tooltip="Nobody has edited it.">
        Not edited yet
      </StatusChip>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.tab();

    expect(screen.getByTestId("chip")).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Nobody has edited it.");
  });
});
