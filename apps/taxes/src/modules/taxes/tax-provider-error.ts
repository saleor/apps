type ExpectedErrorName = "taxjar_no_nexus";
export class ExpectedError extends Error {
  constructor(message: string, options: { cause: ExpectedErrorName }) {
    super(message, options);
  }
}
