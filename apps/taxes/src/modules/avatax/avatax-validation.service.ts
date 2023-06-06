import { z } from "zod";
import { createLogger, Logger } from "../../lib/logger";
import { avataxAddressFactory } from "./address-factory";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig } from "./avatax-config";
import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";

const avataxErrorSchema = z.object({
  code: z.string(),
  details: z.array(
    z.object({
      description: z.string(),
      helpLink: z.string(),
      code: z.string(),
      message: z.string(),
      faultCode: z.string(),
    })
  ),
});

export class AvataxValidationService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      service: "AvataxValidationService",
    });
  }

  private resolveValidationResponse(response: AddressResolutionModel) {
    if (response.messages && response.messages.length > 0) {
      throw new Error(
        "The provided address is invalid. Please visit https://developer.avalara.com/avatax/address-validation/ to learn about address formatting."
      );
    }
  }

  private resolveValidationError(error: unknown): Error {
    const parseResult = avataxErrorSchema.safeParse(error);
    const isErrorParsed = parseResult.success;

    // Avatax doesn't return a type for their error format, so we need to parse the error
    if (isErrorParsed) {
      const { code, details } = parseResult.data;

      if (code === "AuthenticationException") {
        return new Error("Invalid Avatax credentials.");
      }

      return new Error(details[0].message);
    }

    if (error instanceof Error) {
      return error;
    }

    this.logger.error("Unknown error while validating Avatax configuration.");
    return new Error("Unknown error while validating Avatax configuration.");
  }

  async validate(config: AvataxConfig): Promise<void> {
    const avataxClient = new AvataxClient(config);
    const address = avataxAddressFactory.fromChannelAddress(config.address);

    try {
      const validation = await avataxClient.validateAddress({ address });

      this.resolveValidationResponse(validation);
    } catch (error) {
      throw this.resolveValidationError(error);
    }
  }
}
