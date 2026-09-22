import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./callout";

describe("Callout", () => {
  it("renders the title, detail and action", () => {
    render(
      <Callout
        type="info"
        title="This email will not be sent"
        action={<button type="button">Turn on</button>}
        data-test-id="off-callout"
      >
        It is turned off.
      </Callout>,
    );

    expect(screen.getByTestId("off-callout")).toBeInTheDocument();
    expect(screen.getByText("This email will not be sent")).toBeInTheDocument();
    expect(screen.getByText("It is turned off.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Turn on" })).toBeInTheDocument();
  });

  /* Guidance should not interrupt a screen reader mid-task; a fault should. */
  it("announces faults as alerts and guidance as status", () => {
    const { rerender } = render(<Callout type="info" title="Using the built-in template" />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<Callout type="warning" title="The source content changed" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(<Callout type="error" title="The body is too long" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
