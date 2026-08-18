import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsPageContent } from "./settings-page-content";

describe("SettingsPageContent", () => {
  it("renders left-rail description and main children", () => {
    render(
      <SettingsPageContent description="Connect Stripe and map channels." data-test-id="settings">
        <span>Main form</span>
      </SettingsPageContent>,
    );

    expect(screen.getByTestId("settings")).toBeInTheDocument();
    expect(screen.getByText("Connect Stripe and map channels.")).toBeInTheDocument();
    expect(screen.getByText("Main form")).toBeInTheDocument();
  });

  it("renders custom aside below description", () => {
    render(
      <SettingsPageContent
        description="Connect Stripe and map channels."
        aside={<aside>Mode legend</aside>}
        data-test-id="settings-aside"
      >
        <span>Main form</span>
      </SettingsPageContent>,
    );

    expect(screen.getByText("Connect Stripe and map channels.")).toBeInTheDocument();
    expect(screen.getByText("Mode legend")).toBeInTheDocument();
    expect(screen.getByText("Main form")).toBeInTheDocument();
  });
});
