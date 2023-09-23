/**
 * XML-safe escape function.
 * Adapated from https://stackoverflow.com/a/59969621/4981237.
 */
export default function (string) {
  const map = new Map([
    ["&", "&amp;"],
    ['"', "&quot;"],
    ["<", "&lt;"],
    [">", "&gt;"],
  ]);

  const buffer = [];

  for (const char of string) {
    if (map.has(char)) {
      buffer.push(map.get(char));
    } else {
      buffer.push(char);
    }
  }
  return buffer.join("");
}
