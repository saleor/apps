import { join } from "path";
import invariant from "tiny-invariant";

export const resolveTempPdfFileLocation = (fileName: string) => {
  invariant(fileName.includes(".pdf"), `fileName should include pdf extension`);

  return join(process.env.TEMP_PDF_STORAGE_DIR ?? "", encodeURIComponent(fileName));
};
