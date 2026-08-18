import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailSettingsCard, DetailSettingsCardTitle } from "./detail-settings-card";

describe("DetailSettingsCard", () => {
  it("renders title, subtitle, intro, and children", () => {
    render(
      <DetailSettingsCard
        title="Stripe configurations"
        subtitle="2 configurations"
        intro="Connect your Stripe account."
        data-test-id="stripe-configs-card"
      >
        <span>Body content</span>
      </DetailSettingsCard>,
    );

    expect(screen.getByTestId("stripe-configs-card")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Stripe configurations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 configurations")).toBeInTheDocument();
    expect(screen.getByText("Connect your Stripe account.")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders optional mark via DetailSettingsCardTitle", () => {
    render(
      <DetailSettingsCard
        title={
          <DetailSettingsCardTitle optional optionalLabel="Optional">
            Advanced
          </DetailSettingsCardTitle>
        }
      >
        <span>Body</span>
      </DetailSettingsCard>,
    );

    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });
});
