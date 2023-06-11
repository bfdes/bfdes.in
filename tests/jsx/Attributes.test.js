import Attributes from "src/jsx/Attributes";

describe("Attributes.equals", () => {
  it("returns `true` for identical collections", () => {
    const left = new Attributes([
      ["name1", "value1"],
      ["name2", "value2"],
    ]);
    const right = new Attributes([
      ["name2", "value2"],
      ["name1", "value1"],
    ]);
    expect(left.equals(right)).toBe(true);
  });

  it("returns `false` when second argument is not a `Attributes` instance", () => {
    const args = [
      ["name1", "value1"],
      ["name2", "value2"],
    ];
    const attributes = new Attributes(args);
    const map = new Map(args);

    expect(attributes.equals(map)).toBe(false);
  });

  it("returns `false` when one collection is a subset of another", () => {
    const superset = new Attributes([
      ["name1", "value1"],
      ["name2", "value2"],
    ]);
    const subset = new Attributes([["name1", "value1"]]);

    expect(superset.equals(subset)).toBe(false);
    expect(subset.equals(superset)).toBe(false);
  });

  it("returns `false` when names differ", () => {
    const first = new Attributes([["name", "value"]]);
    const second = new Attributes([["key", "value"]]);

    expect(first.equals(second)).toBe(false);
  });

  it("returns `false` when values differ", () => {
    const first = new Attributes([["name", 1]]);
    const second = new Attributes([["name", 2]]);

    expect(first.equals(second)).toBe(false);
  });
});
