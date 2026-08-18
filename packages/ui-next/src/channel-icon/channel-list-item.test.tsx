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
});

describe("ChannelIcon", () => {
  it("renders a globe icon with status title", () => {
    render(<ChannelIcon statusType="success" data-test-id="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("title", "Active");
  });

  it("shows Inactive for hidden status", () => {
    render(<ChannelIcon statusType="hidden" data-test-id="icon" />);
    expect(screen.getByTestId("icon")).toHaveAttribute("title", "Inactive");
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
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(CHANNEL_STATUS_SUCCESS_COLOR).toBe("#0ABF53");
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
