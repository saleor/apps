export type CsvValidationIssue = {
  row: number;
  column: string;
  message: string;
};

export type WooCsvOptions = {
  currencyCode: string;
  decimalSeparator: "." | ",";
};

export type { ImportSession } from "./types";
export type { ImportSessionPreview as ImportPreview } from "./types";

export type SourceOption = {
  id: "google-merchant-feed" | "product-csv" | "woocommerce-csv";
  name: string;
  description: string;
  availability: "available" | "planned";
  logo: "woocommerce" | "feed" | "csv";
};

export type AvailableSourceId = SourceOption["id"];
export type ImportSourceSelectValue = `source:${AvailableSourceId}`;
export type BusyState = "preview" | "import" | null;
