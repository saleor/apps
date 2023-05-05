import { join } from "path";
import invariant from "tiny-invariant";
import { mkdir, access, constants } from "fs/promises";
import { logger } from "@saleor/apps-shared";

/**
 * Path will be relative to built file, in dev its inside .next/server
 */
const DEFAULT_TEMP_FILES_LOCATION = join(__dirname, "_temp");

const getTempPdfStorageDir = () => {
  return process.env.TEMP_PDF_STORAGE_DIR ?? DEFAULT_TEMP_FILES_LOCATION;
};

export const resolveTempPdfFileLocation = async (fileName: string) => {
  invariant(fileName.includes(".pdf"), `fileName should include pdf extension`);

  const dirToWrite = getTempPdfStorageDir();

  await access(dirToWrite, constants.W_OK).catch((e) => {
    logger.debug({ dir: dirToWrite }, "Can't access directory, will try to create it");

    return mkdir(dirToWrite).catch((e) => {
      logger.error(
        { dir: dirToWrite },
        "Cant create a directory. Ensure its writable and check TEMP_PDF_STORAGE_DIR env"
      );
    });
  });

  return join(dirToWrite, encodeURIComponent(fileName));
};
