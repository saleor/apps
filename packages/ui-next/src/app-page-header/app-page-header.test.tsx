import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppPageHeader } from "./app-page-header";

describe("AppPageHeader", () => {
  it("renders title and actions", () => {
    render(<AppPageHeader title="Configuration" actions={<button type="button">Docs</button>} />);

    expect(screen.getByRole("heading", { level: 1, name: "Configuration" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
  });

  it("renders back link when href is set", () => {
    render(<AppPageHeader title="New config" href="/config" hrefTitle="Configuration" />);

    const link = screen.getByTestId("app-page-header-back");

    expect(link).toHaveAttribute("href", "/config");
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });
});
