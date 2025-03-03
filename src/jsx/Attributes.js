export default class Attributes extends Map {
  equals(attributes) {
    return (
      attributes instanceof Attributes &&
      this.size == attributes.size &&
      Array.from(attributes).every(
        ([name, value]) => this.has(name) && this.get(name) === value,
      )
    );
  }

  static empty() {
    return new Attributes();
  }
}
