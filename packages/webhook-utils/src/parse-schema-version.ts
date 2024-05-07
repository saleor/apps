// TODO: export it from app sdk
export const parseSchemaVersion = (rawVersion: string | undefined | null): number | null => {
  if (!rawVersion) {
    return null;
  }

  const [majorString, minorString] = rawVersion.split(".");
  const major = parseInt(majorString, 10);
  const minor = parseInt(minorString, 10);

  if (major && minor) {
    return parseFloat(`${major}.${minor}`);
  }

  return null;
};
