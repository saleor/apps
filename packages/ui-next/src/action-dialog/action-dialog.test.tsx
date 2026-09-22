import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionDialog } from "./action-dialog";

describe("ActionDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <ActionDialog
        open={false}
        title="Disable all notifications?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        data-test-id="bulk-dialog"
      >
        Every event will stop sending mail.
      </ActionDialog>,
    );

    expect(screen.queryByTestId("bulk-dialog")).not.toBeInTheDocument();
  });

  it("confirms with the primary action", async () => {
    const onConfirm = vi.fn();

    render(
      <ActionDialog
        open
        title="Enable all notifications?"
        confirmButtonLabel="Enable all"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      >
        Every event will start sending mail.
      </ActionDialog>,
    );

    expect(screen.getByText("Enable all notifications?")).toBeInTheDocument();
    expect(screen.getByText("Every event will start sending mail.")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("submit"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uses the error confirm variant for delete", () => {
    render(
      <ActionDialog
        open
        title="Disable all notifications?"
        variant="delete"
        confirmButtonLabel="Disable all"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByTestId("submit")).toHaveTextContent("Disable all");
  });

  it("locks cancel and backdrop dismiss while a write is in flight", async () => {
    const onClose = vi.fn();

    render(
      <ActionDialog
        open
        title="Disable all notifications?"
        confirmButtonState="loading"
        disableClose
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByTestId("back")).toBeDisabled();
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("back"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("cancels with the back button", async () => {
    const onClose = vi.fn();

    render(
      <ActionDialog open title="Enable all notifications?" onClose={onClose} onConfirm={vi.fn()} />,
    );

    await userEvent.click(screen.getByTestId("back"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("starts leaving when the confirm succeeds", () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <ActionDialog
        open
        title="Enable all notifications?"
        confirmButtonState="loading"
        disableClose
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    expect(onClose).not.toHaveBeenCalled();

    rerender(
      <ActionDialog
        open
        title="Enable all notifications?"
        confirmButtonState="success"
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
