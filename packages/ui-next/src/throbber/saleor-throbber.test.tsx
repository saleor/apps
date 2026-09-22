import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SaleorThrobber } from "./saleor-throbber";

describe("SaleorThrobber", () => {
  it("exposes a progressbar named Loading", () => {
    render(<SaleorThrobber data-test-id="throbber" />);

    expect(screen.getByTestId("throbber")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
  });
});
