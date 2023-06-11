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

  const stringBuilder = [];

  for (const char of string) {
    if (map.has(char)) {
      stringBuilder.push(map.get(char));
    } else {
      stringBuilder.push(char);
    }
  }
  return stringBuilder.join("");
}
