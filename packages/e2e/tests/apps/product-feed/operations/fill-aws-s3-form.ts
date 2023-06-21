import { FrameLocator, Locator } from "@playwright/test";

export const fillAwsS3Form = async (iframeLocator: FrameLocator) => {
  await iframeLocator.getByLabel("Amazon access key ID").fill("test-id");
  await iframeLocator.getByLabel("Amazon secret access key").fill("test-secret");
  await iframeLocator.getByLabel("Bucket name").fill("test-bucket");
  await iframeLocator.getByLabel("Bucket region").fill("eu-west-1");

  await iframeLocator.getByText("Save bucket configuration").click();
};
