// https://github.com/istanbuljs/v8-to-istanbul/issues/198

export default class Expression {
  constructor(children) {
    this.children = children;
  }

  contains(expression) {
    return (
      this.equals(expression) ||
      this.children.some((child) =>
        child instanceof Expression
          ? child.contains(expression)
          : child === expression,
      )
    );
  }

  equals(expression) {
    return (
      this.children.length == expression.children.length &&
      this.children.every((child, i) =>
        child instanceof Expression
          ? child.equals(expression.children[i])
          : child === expression.children[i],
      )
    );
  }

  find(predicate) {
    const stack = [this];
    const expressions = [];

    while (stack.length != 0) {
      const expression = stack.pop();
      if (predicate(expression)) {
        expressions.push(expression);
      }
      const children =
        expression instanceof Expression ? expression.children : [];
      for (const child of children) {
        stack.push(child);
      }
    }
    return expressions;
  }
}
