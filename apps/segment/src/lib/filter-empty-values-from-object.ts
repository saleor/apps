type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

/**
 * Recursively removes null and undefined values from an object including nested objects and arrays.
 *
 * @param {T} obj - The object to filter
 * @returns {Partial<T>} A new object with null and undefined values removed
 *
 * @example
 * // Simple object
 * filterEmptyValuesFromObject({ a: 1, b: null, c: undefined })
 * // Returns: { a: 1 }
 *
 * @example
 * // Nested object with array
 * filterEmptyValuesFromObject({
 *   items: [
 *     { id: 1, value: null },
 *     { id: 2, value: 'test' }
 *   ]
 * })
 * // Returns: { items: [{ id: 1 }, { id: 2, value: 'test' }] }
 */
export const filterEmptyValuesFromObject = <T extends JsonObject>(obj: T): Partial<T> => {
  if (!obj || typeof obj !== "object") return obj;

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const filtered = value
            .filter((item) => item !== null && item !== undefined)
            .map((item) =>
              typeof item === "object" ? filterEmptyValuesFromObject(item as JsonObject) : item,
            );

          return [key, filtered];
        }
        if (typeof value === "object") {
          return [key, filterEmptyValuesFromObject(value as JsonObject)];
        }
        return [key, value];
      }),
  ) as Partial<T>;
};
