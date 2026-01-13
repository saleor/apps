import { ZodError } from "zod";
import { fromError } from "zod-validation-error";

export const zodReadableError = (error: ZodError) => fromError(error);
