import { randomBytes } from "crypto";

export const generateId = (length = 8) => {
  return randomBytes(length).toString("hex");
};
