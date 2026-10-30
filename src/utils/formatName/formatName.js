// Formats a display name so that every word starts with a capital letter
// and the remaining letters are lowercase, e.g. "JOHN doe" -> "John Doe".
export const toTitleCase = (value) => {
  if (value === null || value === undefined) return "";

  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /\S+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
};
