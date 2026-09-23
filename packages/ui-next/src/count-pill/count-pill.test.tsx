import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountPill, countPillFromNumber } from "./count-pill";

describe("CountPill", () => {
  it("renders the number", () => {
    render(<CountPill count={{ value: 3, hasMore: false }} data-test-id="count" />);

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    expect(screen.getByTestId("count")).toHaveAttribute("data-active", "false");
  });

  it("marks a longer list with a plus", () => {
    render(<CountPill count={{ value: 99, hasMore: true }} active data-test-id="count" />);

    expect(screen.getByTestId("count")).toHaveTextContent("99+");
    expect(screen.getByTestId("count")).toHaveAttribute("data-active", "true");
  });

  it("renders a zero when the caller passed one", () => {
    render(<CountPill count={{ value: 0, hasMore: false }} data-test-id="count" />);

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("renders nothing when there is no count", () => {
    render(<CountPill count={undefined} data-test-id="count" />);

    expect(screen.queryByTestId("count")).not.toBeInTheDocument();
  });
});

describe("countPillFromNumber", () => {
  it("hides zero, the Filters button with nothing applied", () => {
    expect(countPillFromNumber(0)).toBeUndefined();
  });

  it("wraps a positive count", () => {
    expect(countPillFromNumber(3)).toStrictEqual({ value: 3, hasMore: false });
  });

  it("hides a count that is not a finite number", () => {
    expect(countPillFromNumber(Number.NaN)).toBeUndefined();
    expect(countPillFromNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
  });
});

describe("CountPill non-finite values", () => {
  it("renders nothing instead of NaN", () => {
    render(<CountPill count={{ value: Number.NaN, hasMore: false }} data-test-id="count" />);

    expect(screen.queryByTestId("count")).not.toBeInTheDocument();
  });
});
