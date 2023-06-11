import Attributes from "./Attributes";
import Expression from "./Expression";
import escape from "./escape";

export default class Element extends Expression {
  constructor(name, attributes = Attributes.empty(), children = []) {
    super(children);
    this.name = name;
    this.attributes = attributes;
  }

  equals(element) {
    return (
      element instanceof Element &&
      this.name === element.name &&
      this.attributes.equals(element.attributes) &&
      super.equals(element)
    );
  }

  toString() {
    const name = escape(this.name);
    const attributes = Array.from(this.attributes)
      .map(
        ([name, value]) => `${escape(String(name))}="${escape(String(value))}" `
      )
      .join("")
      .trim();
    const { children } = this;

    if (children.length && attributes.length) {
      return `<${name} ${attributes}>${children.join("")}</${name}>`;
    }
    if (children.length) {
      return `<${name}>${children.join("")}</${name}>`;
    }
    if (attributes.length) {
      return `<${name} ${attributes} />`;
    }
    return `<${name} />`;
  }
}
