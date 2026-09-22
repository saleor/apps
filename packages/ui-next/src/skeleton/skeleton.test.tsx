import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("applies the kit class so the Dashboard fill reaches the bar", () => {
    render(<Skeleton data-test-id="skeleton" />);

    expect(screen.getByTestId("skeleton")).toHaveClass("apps-ui-skeleton");
  });

  it("keeps a caller class and does not take macaw's Skeleton data attribute", () => {
    render(<Skeleton className="row-bone" data-test-id="skeleton" />);

    const bar = screen.getByTestId("skeleton");

    expect(bar).toHaveClass("apps-ui-skeleton", "row-bone");
    expect(bar).not.toHaveAttribute("data-macaw-ui-component", "Skeleton");
  });
});
