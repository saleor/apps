import { BaseError } from "../../../error";

export namespace OrderCalculateTaxesErrors {
  export const MissingConfigError = BaseError.subclass("MissingConfigError");
}
