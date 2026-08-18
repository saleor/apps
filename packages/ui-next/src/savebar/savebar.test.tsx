import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Savebar } from "./savebar";

describe("Savebar", () => {
  it("renders cancel and confirm actions", () => {
    render(
      <Savebar>
        <Savebar.Spacer />
        <Savebar.CancelButton>Cancel</Savebar.CancelButton>
        <Savebar.ConfirmButton>Save</Savebar.ConfirmButton>
      </Savebar>,
    );

    expect(screen.getByTestId("savebar")).toBeInTheDocument();
    expect(screen.getByTestId("button-bar-cancel")).toHaveTextContent("Cancel");
    expect(screen.getByTestId("button-bar-confirm")).toHaveTextContent("Save");
  });

  describe("ConfirmButton transition state", () => {
    it("disables confirm when there is nothing to save", () => {
      render(<Savebar.ConfirmButton disabled>Save</Savebar.ConfirmButton>);

      expect(screen.getByTestId("button-bar-confirm")).toBeDisabled();
    });

    it("shows a spinner and blocks clicks while saving", async () => {
      const onClick = vi.fn();

      render(
        <Savebar.ConfirmButton transitionState="loading" noTransition onClick={onClick}>
          Save
        </Savebar.ConfirmButton>,
      );

      const button = screen.getByTestId("button-bar-confirm");

      expect(screen.getByTestId("button-progress")).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-busy", "true");

      await userEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it("shows a checkmark on success", () => {
      render(
        <Savebar.ConfirmButton transitionState="success" noTransition>
          Save
        </Savebar.ConfirmButton>,
      );

      expect(screen.getByTestId("button-success")).toBeInTheDocument();
      expect(screen.getByTestId("button-bar-confirm")).toHaveAttribute(
        "data-test-state",
        "success",
      );
    });

    it("offers a retry label on error", () => {
      render(
        <Savebar.ConfirmButton transitionState="error" noTransition>
          Save
        </Savebar.ConfirmButton>,
      );

      expect(screen.getByTestId("button-bar-confirm")).toHaveTextContent("Try again");
    });

    it("keeps confirm clickable once the completed state cleared", async () => {
      const onClick = vi.fn();

      render(
        <Savebar.ConfirmButton transitionState="default" onClick={onClick}>
          Save
        </Savebar.ConfirmButton>,
      );

      await userEvent.click(screen.getByTestId("button-bar-confirm"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
