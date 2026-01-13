import { BaseError } from "@saleor/errors";
import { z } from "zod";

import { zodReadableError } from "@/lib/zod-readable-error";

export const SHIPPING_COMPANY_CODES = [
  ["50000", "Sagawa Express"],
  ["59010", "Yamato Transport"],
  ["59020", "Japan Transport"],
  ["59030", "Seino Transport"],
  ["59040", "Japan Post Registered mail"],
  ["59041", "Japan Post Yu-Pack"],
  ["59042", "Japan Post Yokuasa 10 ji yubin"],
  ["59043", "Japan Post Yu-Packet"],
  ["59050", "Seino Express"],
  ["59060", "Fukuyama Transport"],
  ["59080", "Niigata Transport"],
  ["59090", "Meitetsu Transport"],
  ["59110", "Shinshu Meitetsu Transport"],
  ["59140", "Toll Express Japan"],
  ["59150", "Eco Distribution"],
  ["59100", "Tonami Transport"],
  ["59160", "JAD Courier Service"],
  ["55555", "Contracted Shipping Company"],
] as const;

// zod enum requires at least one value, so we ensure the first code is always present
const [firstCode, ...restCodes] = SHIPPING_COMPANY_CODES.map(([code]) => code);
const codes = [firstCode, ...restCodes] as const;

export const AtobaraiShippingCompanyCodeSchema = z.enum(codes).brand("AtobaraiShippingCompanyCode");

export const AtobaraiShippingCompanyCodeValidationError = BaseError.subclass(
  "AtobaraiShippingCompanyCodeValidationError",
  {
    props: {
      _brand: "AtobaraiShippingCompanyCodeValidationError" as const,
    },
  },
);

export const createAtobaraiShippingCompanyCode = (raw: string) => {
  const parseResult = AtobaraiShippingCompanyCodeSchema.safeParse(raw);

  if (!parseResult.success) {
    const readableError = zodReadableError(parseResult.error);

    throw new AtobaraiShippingCompanyCodeValidationError(
      `Invalid shipping company code: ${readableError.message}`,
      { cause: readableError },
    );
  }

  return parseResult.data;
};

export type AtobaraiShippingCompanyCode = z.infer<typeof AtobaraiShippingCompanyCodeSchema>;
