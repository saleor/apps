import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DetailSettingsCard,
  detailSettingsCardStyles,
  DetailSettingsCardTitle,
} from "./detail-settings-card";

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

  it("omits the header band when there is no title", () => {
    render(
      <DetailSettingsCard variant="secondary" data-test-id="facts">
        <span>Body</span>
      </DetailSettingsCard>,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("drops the tinted header band on a secondary card", () => {
    render(
      <DetailSettingsCard title="Project overview" variant="secondary" data-test-id="overview">
        <span>Body</span>
      </DetailSettingsCard>,
    );

    expect(screen.getByTestId("overview")).toHaveAttribute("data-variant", "secondary");
  });

  /* Emphasis is composed by the caller, the way `SetupChecklist` takes its elevated class. */
  it("keeps its own chrome when given an emphasis class", () => {
    render(
      <DetailSettingsCard
        title="Production"
        className={detailSettingsCardStyles.elevated}
        data-test-id="production-card"
      >
        <span>Body</span>
      </DetailSettingsCard>,
    );

    const card = screen.getByTestId("production-card");

    expect(card).toHaveClass(detailSettingsCardStyles.elevated);
    expect(card).toHaveClass(detailSettingsCardStyles.card);
  });
});
