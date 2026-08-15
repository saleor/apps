import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsOwnershipChip } from "./settings-ownership-chip";

describe("SettingsOwnershipChip", () => {
  it("renders Shop chip", () => {
    render(<SettingsOwnershipChip ownership="shop" />);

    expect(screen.getByTestId("settings-ownership-shop")).toHaveTextContent("Shop");
  });

  it("renders Channel chip", () => {
    render(<SettingsOwnershipChip ownership="channel" />);

    expect(screen.getByTestId("settings-ownership-channel")).toHaveTextContent("Channel");
  });
});
