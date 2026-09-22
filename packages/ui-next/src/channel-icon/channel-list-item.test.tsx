import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChannelIcon } from "./channel-icon";
import { ChannelListItem } from "./channel-list-item";
import { CHANNEL_STATUS_SUCCESS_COLOR, channelActiveToStatus } from "./types";

describe("channelActiveToStatus", () => {
  it("maps active to success and inactive to hidden", () => {
    expect(channelActiveToStatus(true)).toBe("success");
    expect(channelActiveToStatus(false)).toBe("hidden");
  });

  it("does not treat a missing isActive as inactive", () => {
    expect(channelActiveToStatus(undefined)).toBeUndefined();
    expect(channelActiveToStatus(null)).toBeUndefined();
  });
});

describe("ChannelIcon", () => {
  it("renders a globe icon with status title", () => {
    render(<ChannelIcon statusType="success" data-test-id="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("title", "Active");
    expect(screen.getByTestId("icon")).toHaveAttribute("data-status", "success");
  });

  it("shows Inactive for hidden status", () => {
    render(<ChannelIcon statusType="hidden" data-test-id="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("title", "Inactive");
    expect(screen.getByTestId("icon")).toHaveAttribute("data-status", "hidden");
  });

  it("omits a status title when asked to sit in a sentence", () => {
    render(<ChannelIcon title={null} inline data-test-id="icon" />);
    expect(screen.getByTestId("icon")).not.toHaveAttribute("title");
  });
});

describe("ChannelListItem", () => {
  it("renders name, currency, and icon", () => {
    render(
      <ChannelListItem
        name="United States"
        currencyCode="USD"
        statusType="success"
        data-test-id="row"
      />,
    );

    expect(screen.getByTestId("row")).toBeInTheDocument();
    expect(screen.getByTestId("row")).toHaveAttribute("data-status", "success");
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(CHANNEL_STATUS_SUCCESS_COLOR).toBe("#0ABF53");
  });

  it("marks settings inset so a SettingsSection list can match the card header gutter", () => {
    render(<ChannelListItem name="EU" inset="settings" data-test-id="row" />);

    expect(screen.getByTestId("row")).toHaveAttribute("data-inset", "settings");
  });

  it("shows secondary text after the name", () => {
    render(<ChannelListItem name="Default Channel" secondary="United States" />);

    expect(screen.getByText("Default Channel")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("calls onDisconnect from the hover action", async () => {
    const onDisconnect = vi.fn();

    render(
      <ChannelListItem
        name="Portugal"
        currencyCode="EUR"
        onDisconnect={onDisconnect}
        data-test-id="row"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Disconnect channel" }));
    expect(onDisconnect).toHaveBeenCalledOnce();
  });
});
