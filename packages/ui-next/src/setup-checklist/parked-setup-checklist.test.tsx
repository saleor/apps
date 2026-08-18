import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ParkedSetupChecklist } from "./parked-setup-checklist";

describe("ParkedSetupChecklist", () => {
  it("shows progress and title, and calls onReveal when clicked", async () => {
    const onReveal = vi.fn();

    render(
      <ParkedSetupChecklist
        title="Finish Stripe setup"
        progress={{ done: 1, total: 3 }}
        nextUp="Next up: Assign a channel"
        onReveal={onReveal}
      />,
    );

    expect(screen.getByTestId("parked-setup-checklist-progress")).toHaveTextContent("1/3");
    expect(screen.getByText("Finish Stripe setup")).toBeInTheDocument();
    expect(screen.getByText("Next up: Assign a channel")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Show setup checklist/i }));
    expect(onReveal).toHaveBeenCalledOnce();
  });
});
