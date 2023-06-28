/**
 * Generates a random id containing current time and random string.
 */
export const generateRandomId = () => {
  const date = new Date();
  const offsetInMinutes = date.getTimezoneOffset();
  const randomDate = date.setMinutes(date.getMinutes() + offsetInMinutes).valueOf();
  const randomString = (Math.random() + 1).toString(36).substring(7);

  return `${randomDate}${randomString}`;
};
