import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmButton } from "./confirm-button";

describe("ConfirmButton", () => {
  it("disables confirm when there is nothing to save", () => {
    render(
      <ConfirmButton disabled data-test-id="confirm">
        Save
      </ConfirmButton>,
    );

    expect(screen.getByTestId("confirm")).toBeDisabled();
  });

  it("shows the Saleor throbber and blocks clicks while saving", async () => {
    const onClick = vi.fn();

    render(
      <ConfirmButton
        transitionState="loading"
        noTransition
        onClick={onClick}
        data-test-id="confirm"
      >
        Save
      </ConfirmButton>,
    );

    const button = screen.getByTestId("confirm");

    expect(screen.getByTestId("button-progress")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses a smaller throbber on a small button, matching the label", () => {
    render(
      <ConfirmButton size="small" transitionState="loading" noTransition data-test-id="confirm">
        Save languages
      </ConfirmButton>,
    );

    expect(screen.getByRole("progressbar", { name: "Loading" })).toHaveAttribute("width", "16");
  });

  it("shows a checkmark on success", () => {
    render(
      <ConfirmButton transitionState="success" noTransition data-test-id="confirm">
        Save
      </ConfirmButton>,
    );

    expect(screen.getByTestId("button-success")).toBeInTheDocument();
    expect(screen.getByTestId("confirm")).toHaveAttribute("data-test-state", "success");
  });

  it("offers a retry label on error", () => {
    render(
      <ConfirmButton transitionState="error" noTransition data-test-id="confirm">
        Save
      </ConfirmButton>,
    );

    expect(screen.getByTestId("confirm")).toHaveTextContent("Try again");
  });

  it("keeps confirm clickable once the completed state cleared", async () => {
    const onClick = vi.fn();

    render(
      <ConfirmButton transitionState="default" onClick={onClick} data-test-id="confirm">
        Save
      </ConfirmButton>,
    );

    await userEvent.click(screen.getByTestId("confirm"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
