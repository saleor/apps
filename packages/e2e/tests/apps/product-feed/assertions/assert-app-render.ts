import { expect, FrameLocator } from "@playwright/test";

export const assertAppRender = async (iframeLocator: FrameLocator) => {
  await expect(iframeLocator.getByTestId("root-heading")).toBeVisible();
  await expect(iframeLocator.getByTestId("s3-configuration-section")).toBeVisible();
  await expect(iframeLocator.getByTestId("channels-configuration-section")).toBeVisible();
  await expect(iframeLocator.getByTestId("categories-mapping-section")).toBeVisible();
};
