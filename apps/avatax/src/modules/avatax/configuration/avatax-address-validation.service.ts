import * as Sentry from "@sentry/nextjs";
import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import { Result, fromPromise } from "neverthrow";
import { BaseError } from "../../../error";
import { avataxAddressFactory } from "../address-factory";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxErrorsParser } from "../avatax-errors-parser";

const errorParser = new AvataxErrorsParser(Sentry.captureException);

export class AvataxAddressValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async validate(
    address: AvataxConfig["address"],
  ): Promise<Result<AddressResolutionModel, InstanceType<typeof BaseError>>> {
    const formattedAddress = avataxAddressFactory.fromChannelAddress(address);

    return fromPromise(
      this.avataxClient.validateAddress({ address: formattedAddress }),
      errorParser.parse,
    );
  }
}
