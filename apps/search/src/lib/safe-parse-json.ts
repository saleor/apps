export const safeParseJson = (jsonString: string | null | undefined) => {
  if (!jsonString) {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return jsonString;
  }
};
