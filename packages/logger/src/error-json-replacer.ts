/**
 * `JSON.stringify` drops Error instances to `{}` because `name`, `message` and `stack`
 * are non-enumerable. Without this, `logger.warn("...", { error: e })` logs `"error":{}`.
 */
export const errorJsonReplacer = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      // `cause` is recursively passed through this replacer
      ...(value.cause ? { cause: value.cause } : {}),
    };
  }

  return value;
};
