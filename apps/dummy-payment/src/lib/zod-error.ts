import { ZodError } from "zod";

export function getZodErrorMessage(error: ZodError): string {
  const formattedError = error.format();

  function formatError(obj: any, path: string = ""): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      if (key === "_errors") {
        return value as string[];
      }
      if (typeof value === "object" && value !== null) {
        const newPath = path ? `${path}.${key}` : key;
        return formatError(value, newPath);
      }
      return [];
    });
  }

  const errorMessages = formatError(formattedError);
  return errorMessages.join(". ");
}
