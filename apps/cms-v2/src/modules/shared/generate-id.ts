import { randomBytes } from "crypto";

export const generateId = (length = 8) => {
  return randomBytes(8).toString("hex");
};
