/**
 * Format date to display in logs table (e.g: 12/3/24, 11:09:56 AM)
 */
export const formatUserFriendlyDate = (date: Date): string => {
  const lang = navigator.language ?? "en-GB";

  return Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

/**
 * Format date for format yyyy-mm-dd T hh:mm -> required by RangePicker
 */
export const formatDateForInput = (d: Date): string => {
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${pad(d.getDate())}T${hh}:${mm}`;
};

/**
 * Format date for ISO format with seconds & milliseconds set to 00 -> required by clientLogsRouter.getByDate.
 * It allows us to cache the query as seconds won't change between UI changes.
 */
export const formatDateForQuery = (d: Date): string => {
  d.setSeconds(0);

  d.setMilliseconds(0);

  return d.toISOString();
};
