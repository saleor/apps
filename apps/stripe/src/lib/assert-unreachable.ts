// TODO: consider moving into a shared library
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_value: never): never {
  throw new Error("Statement should be unreachable");
}
