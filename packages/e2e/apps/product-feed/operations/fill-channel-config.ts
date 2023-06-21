import { FrameLocator } from "@playwright/test";

export const fillChannelConfig = async (iframeLocator: FrameLocator) => {
  const channelRow = iframeLocator.getByText("Default channel"); // todo add test-id

  channelRow.click();

  await iframeLocator.getByLabel("Storefront URL").fill("https://www.example.com");
  await iframeLocator
    .getByLabel("Storefront product URL")
    .fill("https://www.example.com/{productId}");

  await iframeLocator.getByText("Save channel settings").click();
};
