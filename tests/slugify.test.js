import slugify from "src/slugify";

const testCases = [
  ["", ""],
  ["hello world", "hello-world"],
  [" left padded", "left-padded"],
  ["right padded ", "right-padded"],
  ["-d-a-s-h-e-d-", "d-a-s-h-e-d"],
  ["double--dashed", "double-dashed"],
  ["under_d", "under_d"],
];

describe("slugify", () => {
  for (const [testInput, expectedValue] of testCases) {
    it(`escapes "${testInput}"`, () => {
      expect(slugify(testInput)).toBe(expectedValue);
    });
  }
});
