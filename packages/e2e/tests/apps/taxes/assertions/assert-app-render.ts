import { expect, FrameLocator } from "@playwright/test";

export const assertAppRender = async (iframeLocator: FrameLocator) => {
  /*
   * TODO Add test-ids assertions after added to app
   * todo assert empty state, but these tests must ensure app has fresh install
   */
  await expect(
    iframeLocator.getByRole("heading", {
      name: "Tax providers",
    })
  ).toBeVisible();
  await expect(iframeLocator.getByRole("heading", { name: "Available channels" })).toBeVisible();
  // await expect(iframeLocator.getByRole("heading", { name: "Tax code matcher" })).toBeVisible(); // todo enable when app enables

  const addProviderButton = await iframeLocator.getByRole("button", {
    name: new RegExp(/Add new|Add first provider/),
  });

  await expect(addProviderButton).toBeVisible();
};
