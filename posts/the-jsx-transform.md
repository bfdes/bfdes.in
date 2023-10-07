---
title: The JSX Transform
tags: [Transpilers]
created: 2023-10-06
summary: Implementing the JSX Transform
---

A couple of years ago, I praised Facebook's frontend library, React. I [talked about](/posts/extending-react.html) how I hijacked React's JSX Transform to write a static site generator (SSG). The SSG used to create this blog.[^1]

Since then, I realized React is not required to define a static website through JSX templating. Modern transpilers let us quickly implement our own JSX libraries from scratch. In return for minimal effort, I was able to write an SSG with the following features:

1. HTML _and_ XML document generation
2. Raw HTML injection
3. Native HTML attribute support in JSX

I will help you write the same SSG. You should read [the first blog post](/posts/extending-react.html) before continuing -- I frequently reference previous work.

## Desugaring JSX

As you know, browsers and [NodeJS](https://nodejs.org) cannot understand JSX, so it must be transpiled to plain JavaScript before use.

Transpilers like [Babel](https://babeljs.io) and [esbuild](https://esbuild.github.io) parse JSX expressions and transform them into calls of a factory function. The path to the factory function is a transpiler directive. You can specify the path in transpiler configuration files like babel.config.js or jsconfig.json.

jsconfig.json should look like

```javascript
{
  "compilerOptions": {
    "jsxFactory": "React.createElement",
  }
}
```

with React as the JSX UI library.[^2]

Recall that the JSX factory must take the form

```typescript
(name: Name, attributes: Attributes, ...children: Element[]) => Element;
```

, where

- `name` is a JSX element name or a JavaScript [identifier](<https://en.wikipedia.org/wiki/Identifier_(computer_languages)>),

- `attributes` is an object keyed by attributes, and

```typescript
type Attributes = { [key: string]: any } | null;
```

- `children` represents _transformed_ child elements.

Before we write the factory, you should play in [a JSX transpiler REPL](https://babeljs.io/repl). Hopefully, you observe five things:

1. `name` is a string for an element with a lowercase name and a JavaScript identifier otherwise[^3]

For example, Babel transforms the component

```javascript
const PaginationLink = ({ slug }) => <a href={`/posts/${slug}.html`}>Next</a>;
```

to

```javascript
const PaginationLink = ({ slug }) =>
  React.createElement("a", { href: `/posts/${slug}.html` }, "Next");
```

, but

```javascript
<PaginationLink slug="extending-react" />
```

becomes

```javascript
React.createElement(PaginationLink, { slug: "extending-react" });
```

2. `children` can be a nested array

Observe that

```javascript
const Languages = ({ children }) => (
  <ul>
    {children.map((language) => (
      <li key={language}>{language}</li>
    ))}
  </ul>
);
```

becomes

```javascript
const Languages = ({ children }) =>
  React.createElement(
    "ul",
    null,
    children.map((language) =>
      React.createElement("li", { key: language }, language),
    ),
  );
```

, not

```javascript
const Languages = ({ children }) =>
  React.createElement(
    "ul",
    null,
    ...children.map((language) =>
      React.createElement("li", { key: language }, language),
    ),
  );
```

3. `attributes` can be `null`

```javascript
const Languages = ({ children }) => (
  <ul>
    {children.map((language) => (
      <li key={language}>{language}</li>
    ))}
  </ul>
);
```

becomes

```javascript
const Languages = ({ children }) =>
  React.createElement(
    "ul",
    null,
    children.map((language) =>
      React.createElement("li", { key: language }, language),
    ),
  );
```

, not

```javascript
const Languages = ({ children }) =>
  React.createElement(
    "ul",
    {},
    children.map((language) =>
      React.createElement("li", { key: language }, language),
    ),
  );
```

Unfortunately, we must respect the precedent set by Babel and React when implementing the JSX factory.

Also, note the presence of a `key` attribute not used by `li`. The `key` attribute informs React which children have changed during a re-render.[^4] We will not need to supply keys to our elements since SSGs only render each element once.

4. Children can come through `attributes`

Observe that the expression

```javascript
<Languages children={["Python", "Java"]}></Languages>
```

, which is very much legal, becomes

```javascript
React.createElement(Languages, {
  children: ["Python", "Java"],
});
```

, not

```javascript
React.createElement(Languages, null, "Python", "Java");
```

React’s `createElement` reads children from `props` -- React's name for `attributes` -- and falls back to `children`:

```javascript
children = props.children ? props.children : children;
```

This behavior makes it possible to pass children to React dynamically. But the expression

```jsx
<Languages>{["Python", "Java"]}</Languages>
```

is more natural to write than

```javascript
<Languages children={["Python", "Java"]} />
```

And if you write

```javascript
<Languages children={["Python", "Java"]}>{["Python", "JavaScript"]}</Languages>
```

, you will find React chooses to discard content between the `Languages` tags.

In my view, it is far better for the JSX factory to reject children passed through a named attribute with an exception.

5. `name` can refer to a fragment

JSX expressions can be elements or fragments. A fragment wraps a series of child expressions in a tag with no name.

To see why fragments are handy, take a look at component `Tags`, which formats tag strings for display:

```javascript
const Tags = ({ children }) => (
  <div>
    {children
      .map((tag) => <Tag key={tag}>{tag}</Tag>)
      .reduce((tags, tag) => [...tags, " # ", tag], [])}
  </div>
);
```

`Tags` wraps its body in a `div` to respect the JSX specification, needlessly inflating the DOM.

Instead, wrap the body in `React.Fragment`:

```javascript
const Tags = ({ children }) => (
  <React.Fragment>
    {children
      .map((tag) => <Tag key={tag}>{tag}</Tag>)
      .reduce((tags, tag) => [...tags, " # ", tag], [])}
  </React.Fragment>
);
```

Even better: tell the transpiler to expand an empty tag to `React.Fragment`.

```javascript
const Tags = ({ children }) => (
  <>
    {children
      .map((tag) => <Tag key={tag}>{tag}</Tag>)
      .reduce((tags, tag) => [...tags, " # ", tag], [])}
  </>
);
```

becomes

```javascript
const Tags = ({ children }) =>
  React.createElement(
    React.Fragment,
    null,
    children
      .map((tag) => React.createElement(Tag, { key: tag }, tag))
      .reduce((tags, tag) => [...tags, " # ", tag], []),
  );
```

## Putting pen to paper

Let's implement the JSX factory, `elem`, armed with our knowledge of the JSX Transform.

`elem` should begin with input sanitation. It must

1. normalize attributes,
2. reject children passed through named attributes, and
3. flatten children:

```javascript
function elem(name, attributes, ...children) {
  attributes = attributes === null ? {} : attributes;
  if ("children" in attributes) {
    throw new IllegalArgumentError(
      "JSX children may not be passed through a named attribute",
    );
  }

  children = children.flat();

  return null; // TODO
}
```

Then `elem` should dispatch on `name`. It must

- wrap children in `Fragment` if `name` refers to `Fragment`, or
- create an `Element` if `name` is a string, or
- call `name` otherwise:

```javascript
function elem(name, attributes, ...children) {
  if (name === Fragment) {
    return new Fragment(children);
  }
  if (isString(name)) {
    return new Element(
      name,
      new Attributes(Object.entries(attributes)),
      children,
    );
  }

  return name({
    ...attributes,
    children,
  });
}
```

`Fragment` and `Element` both extend `Expression`:

```javascript
class Expression {
  constructor(children) {
    this.children = children;
  }
}

class Element extends Expression {
  constructor(name, attributes = new Attributes(), children = []) {
    super(children);
    this.name = name;
    this.attributes = attributes;
  }
}

class Fragment extends Expression {}

class Attributes extends Map {}
```

Thus `Expression` represents a tree of XML nodes.

## HTML, XML, and friends

The code to serialize an `Expression` writes itself:

```javascript
class Element extends Expression {
  toString() {
    const name = escape(this.name);
    const attributes = Array.from(this.attributes)
      .map(
        ([name, value]) =>
          `${escape(String(name))}="${escape(String(value))}" `,
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
```

```javascript
class Fragment extends Expression {
  toString() {
    return this.children.join("");
  }
}
```

Observe that `toString` escapes `name` and `attributes`, but leaves `content` alone. Arbitrary content is tricky to escape. This blog injects HTML by design, anyway.[^5]

Thankfully, escaping XML names and attributes is straightforward.[^6] You need to escape five characters in XML: the [escape character](https://en.wikipedia.org/wiki/Escape_character) `"&"`, `"'"`, `'"'`, `"<"` and `">"`. Also, depending on where they appear, you only need to escape a subset of these five characters.

For example, if you delimit attribute values with `'"'`, `'"'` and `"&"` are the only characters you need to escape within attribute values.

However, being too intelligent leads to bugs and ugly code. I think it is safer to escape all four characters wherever they appear:

```javascript
function escape(string) {
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
```

## Testing, Testing

We aren’t done yet. Any developer worth their salt will want to unit test the components they write. The SSG should provide facilities to query `Expression` trees. I figure two methods on `Expression` are sufficient:

1. `find` _returns expressions satisfying a predicate_, and
2. `contains` _looks for a single expression_.

### `find`

`find` collects matching expressions by carrying out a depth-first traversal of `Expression`:

```javascript
class Expression {
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
```

Here's some test code written with `find`:

```javascript
test("Sidebar renders links", () => {
  const sidebar = <Sidebar />;
  const links = sidebar
    .find((e) => e.name == "a")
    .map((e) => e.attributes.get("href"));

  expect(links).toHaveLength(4);
  expect(links).toContain("/posts");
  expect(links).toContain("/about.html");
  expect(links).toContain("https://github.com/bfdes");
  expect(links).toContain("/feed.rss");
});
```

It verifies the sidebar of this blog displays four links.

### `contains`

`contains` can implemented with `find`. Suppose `Expression` has an `equals` method that respects [value semantics](https://en.wikipedia.org/wiki/Value_object).[^7] Then we can write

```javascript
class Expression {
  contains(expression) {
    return this.find((e) => e.equals(expression)).length > 0;
  }
}
```

and go home.

While this works, it isn't good enough. The whole point of using `contains` over `find` is to terminate early.

This second attempt results in a more effcient search, and it doesn't even cost many LOCs:

```javascript
class Expression {
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
}
```

Here's some test code written with `contains`:

```javascript
test("Meta renders publication date", () => {
  const meta = (
    <Meta
      created={new Date("2019-11-12")}
      tags={["Python", "Java"]}
      wordCount={1}
    />
  );

  expect(meta.contains("12 November 2019")).toBe(true);
});
```

It verifies this blog displays publication dates in Gregorian format.

OK, _now_ we are done. We wrote a JSX UI library in less time than it takes to learn React. But remember: this library is limited to static site generation!

[^1]: I am acutely aware of where I feature on [this diagram](https://rakhim.org/images/honestly-undefined/blogging.jpg).
[^2]: This guide refers to the classic JSX Transform, not the one introduced in React 17.
[^3]: In the case where React is the JSX library, identifiers should resolve to function or class components. Our library will only support stateless function components.
[^4]: Imagine a `Languages` element is passed `["Python", "Java"]` in a first render and `["Java", "Python"]` in a re-render. Without keys, React will recreate all DOM nodes corresponding to the `Languages` element; with stable and unique keys, React will recognize that children have changed places.
[^5]: The library that processes blog post markup returns raw HTML. Accepting user-generated raw HTML will likely lead to XSS attacks, but injecting HTML from a trusted source at build time is fine.
[^6]: According to [StackOverflow](https://stackoverflow.com) users :grimacing:.
[^7]: `equals` is tedious to implement. I leave it as an exercise for the reader :stuck_out_tongue:.
