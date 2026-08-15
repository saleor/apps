import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DetailGroupBox } from "./detail-group-box";

describe("DetailGroupBox", () => {
  it("exposes expanded state and opens when the trigger is clicked", async () => {
    render(
      <DetailGroupBox
        groupId="unassigned-channels"
        dataTestId="unassigned-channels"
        triggerButtonTestId="toggle-unassigned"
        variant="flush"
        headerStart="2 channels not assigned"
      >
        <div>Channel list</div>
      </DetailGroupBox>,
    );

    const section = screen.getByTestId("unassigned-channels");

    expect(section).toHaveAttribute("data-expanded", "false");
    expect(screen.queryByText("Channel list")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("toggle-unassigned"));

    expect(section).toHaveAttribute("data-expanded", "true");
    expect(screen.getByText("Channel list")).toBeInTheDocument();
  });
});
