import JSX from "src/jsx";

describe("Element", () => {
  describe("contains", () => {
    it("delegates to `Element.equals`", () => {
      const element = <link>https://google.com</link>;

      expect(element.contains(<link>https://google.com</link>)).toBeTruthy();
      expect(element.contains(<blink>https://google.com</blink>)).toBeFalsy();
      expect(element.contains(<link>https://amazon.com</link>)).toBeFalsy();
    });

    it("recurses on children", () => {
      const element = (
        <branch>
          <leaf>content</leaf>
        </branch>
      );

      expect(element.contains(<leaf>content</leaf>)).toBeTruthy();
      expect(element.contains("content")).toBeTruthy();
    });
  });

  describe("toString", () => {
    it("renders attributes", () => {
      let element = <leaf name="value" />;
      expect(element.toString()).toBe('<leaf name="value" />');

      element = <leaf name="value">content</leaf>;
      expect(element.toString()).toBe('<leaf name="value">content</leaf>');
    });

    it("renders nested elements", () => {
      const element = (
        <branch>
          <leaf>content</leaf>
        </branch>
      );

      expect(element.toString()).toBe("<branch><leaf>content</leaf></branch>");
    });

    it("renders self-closing elements", () => {
      let element = <leaf />;
      expect(element.toString()).toBe("<leaf />");

      element = <leaf name="value" />;
      expect(element.toString()).toBe('<leaf name="value" />');
    });

    it("escapes attributes", () => {
      const element = <show name="Chip & Dale" />;

      expect(element.toString()).toBe('<show name="Chip &amp; Dale" />');
    });

    it("does not escape content", () => {
      const element = <code>{'<Hello name="Mulder" />'}</code>;

      expect(element.toString()).toBe('<code><Hello name="Mulder" /></code>');
    });
  });
});
