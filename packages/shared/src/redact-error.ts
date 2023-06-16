export const redactError = (err: unknown) => {
  if (err instanceof Error) {
    const { message, stack } = err;

    return {
      message,
      stack,
    };
  } else {
    return {
      message: "Unknown error - redacted",
    };
  }
};
