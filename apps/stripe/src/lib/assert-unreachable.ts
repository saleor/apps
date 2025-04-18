// TODO: consider moving into a shared library
export function assertUnreachable(_value: never): never {
  throw new Error("Statement should be unreachable");
}
