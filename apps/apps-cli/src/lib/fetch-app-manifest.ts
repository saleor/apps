import { AppManifest } from "@saleor/app-sdk/types";

export const fetchAppManifest = async (manifestUrl: string) => {
  const manifestDataResponse = await fetch(manifestUrl);

  let manifestData: AppManifest;

  if (!manifestDataResponse.ok) {
    console.log("Error fetching manifest");
    throw new Error("Error fetching manifest");
  }

  try {
    manifestData = (await manifestDataResponse.json()) as AppManifest;
  } catch (e) {
    console.log("Error parsing manifest");
    throw new Error("Error parsing manifest");
  }

  return manifestData;
};
