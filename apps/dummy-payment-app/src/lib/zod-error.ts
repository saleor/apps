import { type ZodError } from "zod";

export function getZodErrorMessage(error: ZodError): string {
  const formattedError = error.format();

  function formatError(obj: Record<string, unknown>, path: string = ""): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      if (key === "_errors") {
        return value as string[];
      }
      if (typeof value === "object" && value !== null) {
        const newPath = path ? `${path}.${key}` : key;

        return formatError(value as Record<string, unknown>, newPath);
      }

      return [];
    });
  }

  const errorMessages = formatError(formattedError as Record<string, unknown>);

  return errorMessages.join(". ");
}
