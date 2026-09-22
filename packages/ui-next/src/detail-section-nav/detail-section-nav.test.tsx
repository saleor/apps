import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DetailSectionNav } from "./detail-section-nav";

const items = [
  { id: "delivery", label: "Delivery" },
  { id: "branding", label: "Branding" },
];

describe("DetailSectionNav", () => {
  it("renders one row per section", () => {
    render(<DetailSectionNav items={items} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Delivery" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Branding" })).toBeInTheDocument();
  });

  it("marks the section in view as current", () => {
    render(<DetailSectionNav items={items} activeId="branding" onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Branding" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("button", { name: "Delivery" })).not.toHaveAttribute("aria-current");
  });

  it("reports the section that was clicked", async () => {
    const onSelect = vi.fn();

    render(<DetailSectionNav items={items} onSelect={onSelect} />);

    screen.getByRole("button", { name: "Branding" }).click();

    expect(onSelect).toHaveBeenCalledWith("branding");
  });

  /* Two of these can share a page (settings rail, entity detail), so each needs its own name. */
  it("names the nav for assistive technology", () => {
    render(
      <DetailSectionNav items={items} ariaLabel="Email settings sections" onSelect={vi.fn()} />,
    );

    expect(screen.getByRole("navigation", { name: "Email settings sections" })).toBeInTheDocument();
  });
});
