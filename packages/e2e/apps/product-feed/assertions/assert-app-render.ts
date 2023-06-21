import { expect, FrameLocator } from "@playwright/test";

export const assertAppRender = async (iframeLocator: FrameLocator) => {
  // assert all sections are visible by their headers, todo add more / add by test id
  await expect(iframeLocator.getByText("AWS S3 Bucket")).toBeVisible();
  await expect(iframeLocator.getByText("Channels configuration")).toBeVisible();
  await expect(iframeLocator.getByText("Categories mapping")).toBeVisible();
};
