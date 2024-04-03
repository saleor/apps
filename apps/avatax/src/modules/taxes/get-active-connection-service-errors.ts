import { BaseError } from "../../error";

const ActiveConnectionServiceError = BaseError.subclass("ActiveConnectionServiceError");

export type ActiveConnectionServiceErrorsUnion =
  (typeof ActiveConnectionServiceErrors)[keyof typeof ActiveConnectionServiceErrors];

export const ActiveConnectionServiceErrors = {
  /**
   * TODO: What does it mean?  How it should behave?
   */
  MissingChannelSlugError: ActiveConnectionServiceError.subclass("MissingChannelSlugError"),

  MissingMetadataError: ActiveConnectionServiceError.subclass("MissingMetadataError"),

  /**
   * TODO: What does it mean?  How it should behave?
   * Should it be handled as BrokenConfigurationError?
   */
  ProviderNotAssignedToChannelError: ActiveConnectionServiceError.subclass(
    "ProviderNotAssignedToChannelError",
  ),

  /**
   * Will happen when `order-confirmed` webhook is triggered by creating an order in a channel that doesn't use the tax app
   */
  WrongChannelError: ActiveConnectionServiceError.subclass("WrongChannelError"),

  BrokenConfigurationError: ActiveConnectionServiceError.subclass("BrokenConfigurationError"),
} as const;
