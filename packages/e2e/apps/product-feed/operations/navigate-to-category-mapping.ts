import { FrameLocator, expect } from "@playwright/test";

export const navigateToCategoryMapping = async (iframeLocator: FrameLocator) => {
  await iframeLocator.getByText("Map categories").click();

  /*
   * todo - add test-id. Timeout is longer because it dynamically fetches huge categories list
   * todo this doesnt work
   */
  await expect(iframeLocator.getByText("Save", { exact: true })).toBeVisible({ timeout: 60000 });
  await expect(iframeLocator.getByText("Categories Mapping")).toBeVisible({ timeout: 60000 });
};
