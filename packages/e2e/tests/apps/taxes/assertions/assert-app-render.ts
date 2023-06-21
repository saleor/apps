import { expect, FrameLocator } from "@playwright/test";

export const assertAppRender = async (iframeLocator: FrameLocator) => {
  /*
   * TODO Add test-ids assertions after added to app
   * todo assert empty state, but these tests must ensure app has fresh install
   */
  await expect(iframeLocator.getByText("Tax providers")).toBeVisible();
  await expect(iframeLocator.getByText("Available channels")).toBeVisible();
  await expect(iframeLocator.getByText("Tax code matcher")).toBeVisible();

  const firstProviderButton = await iframeLocator.getByText("Add first provider");
  const addNextProviderButton = await iframeLocator.getByText("Add new");

  // TODO verify if buttons exist (add configs)
};
