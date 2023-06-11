import Expression from "./Expression";

export default class Fragment extends Expression {
  equals(fragment) {
    return fragment instanceof Fragment && super.equals(fragment);
  }

  toString() {
    return this.children.join("");
  }
}
