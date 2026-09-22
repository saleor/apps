import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ListSubheader } from "./list-subheader";

describe("ListSubheader", () => {
  it("renders the group label and its trailing text", () => {
    render(
      <ListSubheader end="3 of 7 on" data-test-id="group-orders">
        Orders
      </ListSubheader>,
    );

    expect(screen.getByTestId("group-orders")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("3 of 7 on")).toBeInTheDocument();
  });

  /* Kept off the band itself: a sentence there pushes every row of the group down. */
  it("keeps the group caveat on an info glyph after the label", async () => {
    render(
      <ListSubheader
        note="Three of these can fire for one order."
        noteLabel="About order notifications"
        data-test-id="group-orders"
      >
        Orders
      </ListSubheader>,
    );

    expect(screen.queryByText("Three of these can fire for one order.")).not.toBeInTheDocument();

    await userEvent.tab();

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Three of these can fire for one order.",
    );
  });

  it("renders without trailing text", () => {
    render(<ListSubheader data-test-id="group-orders">Orders</ListSubheader>);

    expect(screen.getByTestId("group-orders")).toBeInTheDocument();
  });

  /* The label already says "Orders"; a screen reader announcing the glyph too would repeat it. */
  it("hides the icon from assistive technology", () => {
    render(
      <ListSubheader icon={<svg data-test-id="group-icon" />} data-test-id="group-orders">
        Orders
      </ListSubheader>,
    );

    expect(screen.getByTestId("group-icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});
