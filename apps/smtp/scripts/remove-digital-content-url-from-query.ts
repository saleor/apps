export const removeDigitalContentUrlFromQuery = (
  query: string | null | undefined,
): { query: string; changed: boolean } | null => {
  if (!query) {
    return null;
  }

  /*
   * Remove digitalContentUrl field, optionally followed by a selection set { ... }
   * Handles both minified (single-line) and formatted (multi-line) queries
   */
  const newQuery = query
    .replace(/\s*\bdigitalContentUrl\b(?:\s*\{[^}]*\})?/g, "")
    .replace(/\n\s*\n/g, "\n");

  return {
    query: newQuery,
    changed: newQuery !== query,
  };
};
