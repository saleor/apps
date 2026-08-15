import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Savebar } from "./savebar";

describe("Savebar", () => {
  it("renders cancel and confirm actions", () => {
    render(
      <Savebar>
        <Savebar.Spacer />
        <Savebar.CancelButton>Cancel</Savebar.CancelButton>
        <Savebar.ConfirmButton>Save</Savebar.ConfirmButton>
      </Savebar>,
    );

    expect(screen.getByTestId("savebar")).toBeInTheDocument();
    expect(screen.getByTestId("button-bar-cancel")).toHaveTextContent("Cancel");
    expect(screen.getByTestId("button-bar-confirm")).toHaveTextContent("Save");
  });
});
