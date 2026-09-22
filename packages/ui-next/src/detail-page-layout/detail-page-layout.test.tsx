import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DetailPageLayout } from "./detail-page-layout";

describe("DetailPageLayout", () => {
  it("renders header, content, and children", () => {
    render(
      <DetailPageLayout data-test-id="layout">
        <span>Header</span>
        <DetailPageLayout.Content>
          <span>Body</span>
        </DetailPageLayout.Content>
      </DetailPageLayout>,
    );

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  /* A Savebar is fixed to the frame, so the layout under it has to fill the frame too. */
  it("fills the frame height for a savebar without being asked twice", () => {
    const { rerender } = render(
      <DetailPageLayout fillHeight data-test-id="layout">
        <DetailPageLayout.Content>Body</DetailPageLayout.Content>
      </DetailPageLayout>,
    );

    const fillHeightClass = screen.getByTestId("layout").className;

    rerender(
      <DetailPageLayout withSavebar data-test-id="layout">
        <DetailPageLayout.Content>Body</DetailPageLayout.Content>
      </DetailPageLayout>,
    );

    for (const className of fillHeightClass.split(" ")) {
      expect(screen.getByTestId("layout")).toHaveClass(className);
    }
  });
});
