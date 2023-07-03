import { FrameLocator } from "@playwright/test";

export const fillChannelConfig = async (iframeLocator: FrameLocator) => {
  const sectionsSelector = await iframeLocator.getByTestId("channels-configuration-section");

  const channelRow = sectionsSelector.getByText("Default channel"); // todo add test-id

  channelRow.click();

  await sectionsSelector.getByLabel("Storefront URL").fill("https://www.example.com");
  await sectionsSelector
    .getByLabel("Storefront product URL")
    .fill("https://www.example.com/{productId}");

  await sectionsSelector.getByText("Save channel settings").click();
};
