import { BaseError } from "@saleor/errors";

export const UnknownError = BaseError.subclass("UnknownError");

export const ValueError = BaseError.subclass("ValueError");

export { BaseError };
