import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ExitFormDialog } from "./exit-form-dialog";

describe("ExitFormDialog", () => {
  it("renders nothing when closed", () => {
    render(<ExitFormDialog isOpen={false} onClose={vi.fn()} onLeave={vi.fn()} />);

    expect(screen.queryByTestId("exit-form-dialog")).not.toBeInTheDocument();
  });

  it("keeps editing on cancel", async () => {
    const onClose = vi.fn();
    const onLeave = vi.fn();

    render(<ExitFormDialog isOpen onClose={onClose} onLeave={onLeave} />);

    await userEvent.click(screen.getByTestId("keep-editing"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("leaves when changes are ignored", async () => {
    const onLeave = vi.fn();

    render(<ExitFormDialog isOpen onClose={vi.fn()} onLeave={onLeave} />);

    await userEvent.click(screen.getByTestId("ignore-changes"));

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("supports a custom description", () => {
    render(
      <ExitFormDialog
        isOpen
        onClose={vi.fn()}
        onLeave={vi.fn()}
        description="Stripe keys will not be saved."
      />,
    );

    expect(screen.getByTestId("exit-form-dialog-description")).toHaveTextContent(
      "Stripe keys will not be saved.",
    );
  });
});
