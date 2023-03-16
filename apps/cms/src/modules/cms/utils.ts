export const generateUniqueId = () => {
  const date = new Date();
  const offsetInMinutes = date.getTimezoneOffset();

  const randomDate = date.setMinutes(date.getMinutes() + offsetInMinutes).valueOf();
  const randomString = (Math.random() + 1).toString(36).substring(7);

  return `${randomString}${randomDate}`;
};
