import { z } from "zod";
import { createLogger } from "../../../logger";

const avataxErrorSchema = z.object({
  code: z.string(),
  details: z.array(
    z.object({
      description: z.string(),
      helpLink: z.string(),
      code: z.string(),
      message: z.string(),
      faultCode: z.string(),
    }),
  ),
});

export class AvataxValidationErrorResolver {
  private logger = createLogger("AvataxValidationErrorResolver");

  resolve(error: unknown): Error {
    const parseResult = avataxErrorSchema.safeParse(error);
    const isErrorParsed = parseResult.success;

    // AvaTax doesn't return a type for their error format, so we need to parse the error
    if (isErrorParsed) {
      const { code, details } = parseResult.data;

      if (code === "AuthenticationException") {
        return new Error("Invalid AvaTax credentials.");
      }

      return new Error(details[0].message);
    }

    if (error instanceof Error) {
      return error;
    }

    this.logger.error("Unknown error while validating AvaTax configuration.");
    return new Error("Unknown error while validating AvaTax configuration.");
  }
}
