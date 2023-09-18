import React, { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGetFeedApiUrl } from "./use-get-feed-api-url";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";

describe("useGetFeedApiUrl", function () {
  const appBridge = new AppBridge({ saleorApiUrl: "https://example.com/graphql/" });

  const HookWrapper = ({ children }: PropsWithChildren<{}>) => {
    return <AppBridgeProvider appBridgeInstance={appBridge}>{children}</AppBridgeProvider>;
  };

  it("Constructs valid URL from window origin and channel slug", () => {
    const { result } = renderHook(() => useGetFeedApiUrl("test-slug"), {
      wrapper: HookWrapper,
    });

    expect(result.current).toEqual(
      "http://localhost:3000/api/feed/https%3A%2F%2Fexample.com%2Fgraphql%2F/test-slug/google.xml"
    );
  });
});
