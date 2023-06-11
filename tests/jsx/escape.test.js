import escape from "src/jsx/escape";

const testCases = [
  ["", ""],
  ['console.log("Hello, World!")', "console.log(&quot;Hello, World!&quot;)"],
  ["<title>index.html</title>", "&lt;title&gt;index.html&lt;/title&gt;"],
  [
    "<ul><li>Python</li><li>Java</li></ul>",
    "&lt;ul&gt;&lt;li&gt;Python&lt;/li&gt;&lt;li&gt;Java&lt;/li&gt;&lt;/ul&gt;",
  ],
  ["Chip & Dale", "Chip &amp; Dale"],
];

describe("escape", () => {
  for (const [testCase, expectedValue] of testCases) {
    it(`escapes "${testCase}"`, () => {
      expect(escape(testCase)).toBe(expectedValue);
    });
  }
});
