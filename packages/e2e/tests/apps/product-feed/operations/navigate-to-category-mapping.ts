import { FrameLocator, expect } from "@playwright/test";

export const navigateToCategoryMapping = async (iframeLocator: FrameLocator) => {
  await iframeLocator.getByText("Map categories").click({ force: true });

  await expect(iframeLocator.getByTestId("categories-mapping-container")).toBeVisible();

  // todo doesnt load, probably app must be optimized
  await expect(iframeLocator.getByText("Accessories")).toBeVisible({
    timeout: 120000,
  });
};
