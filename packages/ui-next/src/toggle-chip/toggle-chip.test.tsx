import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToggleChip } from "./toggle-chip";

describe("ToggleChip", () => {
  it("reports the state it is in", () => {
    render(
      <ToggleChip pressed onPressedChange={() => {}} data-test-id="chip">
        Sending to customers
      </ToggleChip>,
    );

    expect(screen.getByTestId("chip")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("chip")).toHaveTextContent("Sending to customers");
  });

  it("flips on click", async () => {
    const onPressedChange = vi.fn();

    render(
      <ToggleChip pressed={false} onPressedChange={onPressedChange} data-test-id="chip">
        Not sending to customers
      </ToggleChip>,
    );

    await userEvent.click(screen.getByTestId("chip"));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  /* The pill is the control, so the keyboard has to reach it — the inner Toggle is scenery. */
  it("flips on Enter and Space, and is a single tab stop", async () => {
    const onPressedChange = vi.fn();

    render(
      <ToggleChip pressed onPressedChange={onPressedChange} data-test-id="chip">
        Sending to customers
      </ToggleChip>,
    );

    await userEvent.tab();
    expect(screen.getByTestId("chip")).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(onPressedChange).toHaveBeenCalledTimes(2);
    expect(onPressedChange).toHaveBeenCalledWith(false);

    await userEvent.tab();
    expect(screen.getByTestId("chip")).not.toHaveFocus();
  });

  it("does not flip while disabled", async () => {
    const onPressedChange = vi.fn();

    render(
      <ToggleChip pressed={false} disabled onPressedChange={onPressedChange} data-test-id="chip">
        Not sending to customers
      </ToggleChip>,
    );

    await userEvent.click(screen.getByTestId("chip"));

    expect(onPressedChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("chip")).toHaveAttribute("aria-disabled", "true");
  });

  it("explains the state on focus", async () => {
    render(
      <ToggleChip
        pressed={false}
        onPressedChange={() => {}}
        tooltip="Customers get nothing when this happens."
        data-test-id="chip"
      >
        Not sending to customers
      </ToggleChip>,
    );

    await userEvent.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Customers get nothing when this happens.",
    );
  });
});
