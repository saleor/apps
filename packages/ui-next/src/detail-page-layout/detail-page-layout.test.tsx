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
});
