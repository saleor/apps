function assertUnreachable(_value: never): never {
  throw new Error("Statement should be unreachable");
}
