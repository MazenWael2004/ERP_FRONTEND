/** Formats raw API/SQL dates for Excel without timezone-driven day changes. */
export const excelDate = (value: unknown) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

/** Keeps the time part when a report exports a datetime column. */
export const excelDateTime = (value: unknown) => {
  const date = excelDate(value);
  if (!date) return '';
  const time = String(value || '').match(/[T\s](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?/);
  return time ? `${date} ${time[1]}` : date;
};
