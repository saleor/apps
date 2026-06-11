import { BaseError } from "../errors";

export type InvariantErrorProps = { expected: boolean };

export const InvariantError = BaseError.subclass("InvariantError", {
  props: {} as InvariantErrorProps,
});

export function invariant(
  condition: unknown,
  message?: string,
  opts?: { expected?: boolean }
): asserts condition {
  const { expected = false } = opts ?? {};

  if (!condition) {
    const err = new InvariantError(`Invariant failed: ${message || ""}`, {
      props: { expected } as InvariantErrorProps,
    });
    // remove utils.js from stack trace for better error messages
    const stack = (err.stack ?? "").split("\n");

    stack.splice(1, 1);

    err.stack = stack.join("\n");

    throw err;
  }
}

/* c8 ignore start */
export function assertUnreachableButNotThrow(_: never) {
  return null as never;
}
/* c8 ignore stop */
