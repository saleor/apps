export const safeParseJson = (jsonString: string) => {
  if (!jsonString) {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return jsonString;
  }
};
