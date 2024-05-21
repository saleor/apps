import { BaseError } from "../../error";

const UnreachableCaseReachedError = BaseError.subclass("UnreachableCaseReachedError");

export const assertUnreachable = (_value: never): never => {
  throw new UnreachableCaseReachedError("Statement should be unreachable");
};
