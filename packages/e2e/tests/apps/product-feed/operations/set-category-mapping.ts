import { FrameLocator } from "@playwright/test";

export const setCategoryMapping = async (iframeLocator: FrameLocator) => {
  await iframeLocator.locator("select").first().selectOption({ index: 0 });

  await iframeLocator.getByText("Save").first().click();
};
