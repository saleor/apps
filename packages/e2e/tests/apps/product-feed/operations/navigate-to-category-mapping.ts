import { FrameLocator, expect } from "@playwright/test";

export const navigateToCategoryMapping = async (iframeLocator: FrameLocator) => {
  await iframeLocator.getByText("Map categories").click({ force: true });

  /*
   * todo this doesnt work.
   */
  await expect(iframeLocator.getByTestId("categories-mapping-container")).toBeVisible({
    timeout: 60000,
  });
};
