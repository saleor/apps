import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyAssignCallout } from "./empty-assign-callout";

describe("EmptyAssignCallout", () => {
  it("renders title, description, and action", () => {
    render(
      <EmptyAssignCallout
        icon={<span data-test-id="empty-icon" />}
        title="No channels assigned"
        description="Assign a channel to enable Stripe at checkout."
        action={<button type="button">Assign</button>}
      />,
    );

    expect(screen.getByTestId("empty-assign-callout")).toBeInTheDocument();
    expect(screen.getByText("No channels assigned")).toBeInTheDocument();
    expect(screen.getByText("Assign a channel to enable Stripe at checkout.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assign" })).toBeInTheDocument();
  });
});
