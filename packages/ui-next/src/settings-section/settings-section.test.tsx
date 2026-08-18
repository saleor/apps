import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsSection } from "./settings-section";

describe("SettingsSection", () => {
  it("renders title, ownership chip, description, and children", () => {
    render(
      <SettingsSection
        title="Stripe configurations"
        ownership="shop"
        description="These settings apply store-wide."
        data-test-id="stripe-section"
      >
        <span>Body</span>
      </SettingsSection>,
    );

    expect(screen.getByTestId("stripe-section")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Stripe configurations" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("settings-ownership-shop")).toBeInTheDocument();
    expect(screen.getByText("These settings apply store-wide.")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
