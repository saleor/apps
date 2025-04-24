import { BaseError } from "./errors";

// TODO: consider moving into a shared library
export function assertUnreachable(_value: never): never {
  throw new BaseError("Statement should be unreachable");
}
