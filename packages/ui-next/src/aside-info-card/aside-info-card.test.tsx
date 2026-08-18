import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AsideInfoCard } from "./aside-info-card";

describe("AsideInfoCard", () => {
  it("renders title and body without a fold", () => {
    render(
      <AsideInfoCard title="Test vs live mode" data-test-id="info">
        <span>Mode details</span>
      </AsideInfoCard>,
    );

    expect(screen.getByTestId("info")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Test vs live mode" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mode details")).toBeInTheDocument();
    expect(screen.queryByTestId("info-fold-trigger")).not.toBeInTheDocument();
  });

  it("expands and collapses the foldable footer", async () => {
    render(
      <AsideInfoCard
        title="Legend"
        data-test-id="info"
        fold={{
          title: "Get keys in Stripe Dashboard",
          children: <span>Step one</span>,
        }}
      >
        <span>Visible body</span>
      </AsideInfoCard>,
    );

    expect(screen.queryByText("Step one")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("info-fold-trigger"));

    expect(screen.getByTestId("info-fold-panel")).toHaveTextContent("Step one");
    expect(screen.getByTestId("info-fold-trigger")).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByTestId("info-fold-trigger"));

    expect(screen.queryByText("Step one")).not.toBeInTheDocument();
  });
});
