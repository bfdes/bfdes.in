---
title: Extending React
tags: [Transpilers]
created: 2021-05-12
summary: Extending React's JSX API
---

Facebook's JavaScript UI library React took the world of frontend development [by storm](https://trends.google.com/trends/explore?date=2013-05-29%202021-01-01&q=%2Fm%2F012l1vxv) after its public introduction at [JSConf 2013](https://www.youtube.com/watch?v=GW0rj4sNH2w).

Unlike Model-View frameworks, React drives UI updates by declarative state management. Controversially, React introduced an XML-like syntax extension to JavaScript called [JSX](https://reactjs.org/docs/introducing-jsx.html). It allows programmers to combine markup and render logic in application code.

The idioms React promoted were not initially well-received but quickly gained wide acceptance.

We will extend React's JSX API to create a small NodeJS library for static site generation. The library will expose `File` and `Dir` JSX primitives that can be composed to define a website.

For example, the following router describes part of this blog:

```javascript
const router = (
  <Dir name="site">
    <File name="index.html">
      <Posts>{posts}</Posts>
    </File>
    <Dir name="posts">
      {posts.map(({ slug, ...post }) => (
        <File name={`${slug}.html`}>
          <Post {...post} />
        </File>
      ))}
    </Dir>
  </Dir>
);
```

The command `router.write(dirPath)` writes the site to disk, mounting the files

```shell
site
  ├── index.html
  └── posts
      └── extending-react.html
```

in the directory `dirPath`.

Anyone can use this library to roll their own React-based static site generator (SSG).

## React 101

A minimal understanding of how React works is required to extend its API. Let's review some concepts.

### Components and Elements

React projects consist of template entities called components. They can be declared with a class or with a function.[^1]

For example,

```javascript
class PaginationLink extends React.Component {
  render() {
    return <a href={`/posts/${this.props.slug}.html`}>Next</a>;
  }
}
```

and

```javascript
const PaginationLink = ({ slug }) => <a href={`/posts/${slug}.html`}>Next</a>;
```

are equivalent ways of declaring a `PaginationLink` component. `PaginationLink` accepts a `slug` property or "prop" as input. `slug` tells a `PaginationLink` element where it should point.

For example,

```javascript
<PaginationLink slug="extending-react" />
```

refers a reader to this post.

You can regard an element as an instance of a component. Elements can be rendered to the DOM by a browser:

```javascript
const node = <App />;
render(node, document.getElementById("root"));
```

Elements can also be serialized into a string by a server:

```javascript
console.log(renderToStaticMarkup(<App />));
```

Note that function components and the `render` method of class components can themselves return elements; this is by design -- it enables composition.

### Composition and Children

React promotes code reuse through composition.[^2]

A component's `children` prop provides access to the children passed to it. `children` can be used to define generic components that find out their children at runtime.

For example,

```javascript
const Page = ({ children }) => (
  <html lang="en">
    <Head />
    <Body>{children}</Body>
  </html>
);
```

adds an identical header to every child.

I use `Page` to assemble the colophon of this blog:

```javascript
const About = () => (
  <Page>
    <div className="about">
      <h1>About</h1>
      <p>
        Hello, my name is Bruno Fernandes, and I write code for fun and profit.
      </p>
    </div>
  </Page>
);
```

### Desugaring JSX

Browsers and NodeJS cannot understand JSX, so it must be transpiled to plain JavaScript before use.

During transpilation, transpilers such as [Babel](https://babeljs.io/) and [esbuild](https://esbuild.github.io/) transform any JSX expressions they encounter into calls of a JSX factory function. Historically, the factory was `React.createElement`. Now, transpilers accomodate a variety of UI frameworks through a [transpiler directive](<https://en.wikipedia.org/wiki/Directive_(programming)>).

For example, the script

```javascript
import React from "react";

const PaginationLink = ({ slug }) => <a href={`/posts/${slug}.html`}>Next</a>;

renderToStaticMarkup(<PaginationLink slug="extending-react" />);
```

could be transformed into

```javascript
import React from "react";

const PaginationLink = ({ slug }) =>
  React.createElement("a", { href: `/posts/${slug}.html` }, "Next");

renderToStaticMarkup(
  React.createElement(PaginationLink, { slug: "extending-react" })
);
```

by the first stage of a preprocessor or transpiler for React.

The JSX factory must take the form of

```javascript
function createElement(type, props, ...children) {}
```

, where

- `type` is the JSX element type,
- `props` is an object keyed by props passed to the element, and
- `children` represents _transformed_ child elements.[^3]

Also, note that the `React` object must be in scope wherever you use JSX.[^4]

## Putting pen to paper

We can exploit a user-customizable JSX transform and composition to implement our API. The idea is simple: calls to `File` or `Dir` "components" should be intercepted and recast as instantiations of filesystem objects. These objects must know how to write their contents to disk recursively.

### The filesystem abstraction

Observe that files and directories form trees in which files are the terminal nodes. Any file or directory should be able to write its contents to disk when given a root path.

We can encode this contract in an interface `FileSystem`:

```typescript
interface FileSystem {
  name: string;
  content: string | FileSystem[];

  write(rootPath: string): Promise<void>;
}
```

And `File` and `Dir` can implement `FileSystem`:

```typescript
import fs from "fs/promises";
import path from "path";

class File implements FileSystem {
  public name: string;
  public content: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }

  async write(rootPath: string) {
    const filePath = path.join(rootPath, this.name);
    try {
      await fs.writeFile(filePath, this.content);
    } catch (_) {
      throw new Error(filePath);
    }
  }
}
```

```typescript
class Dir implements FileSystem {
  public name: string;
  public content: FileSystem[];

  constructor(name: string, content: FileSystem[] = []) {
    this.name = name;
    this.content = content;
  }

  async write(rootPath: string) {
    const dirPath = path.join(rootPath, this.name);
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (_) {
      throw new Error(dirPath);
    }
    await Promise.all(this.content.map((file) => file.write(dirPath)));
  }
}
```

A partial write will occur if a call to `write` fails. This is acceptable. The SSG overwrites content between runs, so a failure followed by a retry will be indistinguishable from a successful run.

### Hijacking the JSX Transform

Tell the build tool to transform JSX expressions using our _own_ factories:

1. A JSX element should turn into a call of `JSX.createElement`, and
2. a JSX fragment should expand to reference `JSX.Fragment`.[^5]

If you use Babel, populate babel.config.js with

```javascript
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        pragma: "JSX.createElement",
        pragmaFrag: "JSX.Fragment",
      },
    ],
  ],
};
```

Or if you use esbuild, populate jsconfig.json with

```json
{
  "compilerOptions": {
    "jsxFactory": "JSX.createElement",
    "jsxFragmentFactory": "JSX.Fragment"
  }
}
```

Then export stub `File` and `Dir` components for application code to reference:

```javascript
export const File = () => <></>;
export const Dir = () => <></>;
```

Our JSX transformer `createElement` should handle any `File` or `Dir` references and delegate all other calls to React:

```javascript
const JSX = {
  createElement(type, props, ...children) {
    if (type === Dir) {
      return createDir(props, children);
    }
    if (type === File) {
      return createFile(props, children);
    }
    return React.createElement(type, props, ...children);
  },
  Fragment: React.Fragment,
};
```

`createDir` verifies that all JSX children are `FileSystem` instances before creating a `Dir`:

```javascript
function createDir(props, children) {
  const { name } = props;
  children = children.flat();

  if (!children.every((child) => child instanceof FileSystem)) {
    throw new IllegalArgumentError(
      `Children of directory ${name} must be directory or file elements`
    );
  }
  return new Dir(name, children);
}
```

`createFile` verifies that there is only one JSX child before creating a `File`:

```javascript
function createFile(props, children) {
  const { name } = props;

  if (children.length !== 1) {
    throw new IllegalArgumentError(
      `File ${name} must have a single child element or string content`
    );
  }

  const [content] = children;

  if (React.isValidElement(content)) {
    const page = `<!DOCTYPE html>${renderToStaticMarkup(content)}`;
    return new File(name, page);
  }
  return new File(name, content);
}
```

That's it! We are done :tada:.[^6]

[^1]: Before the introduction of [React Hooks](https://reactjs.org/docs/hooks-intro.html) in React 16.8, class and function components served different purposes. Now function components can also manipulate React state, class components are somewhat redundant.
[^2]: React favours [composition over inheritance](https://en.wikipedia.org/wiki/Composition_over_inheritance).
[^3]: `type` is a string for an element with a lowercase name and a function or class reference otherwise. Therefore, start the name of a user-defined React component with a capital letter. Altenatively, assign it to a capitalized variable before use.
[^4]: Since the release of React 17, many transpilers [can "automatically import" React](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) :open_mouth:.
[^5]: [Fragment syntax](https://react.dev/reference/react/Fragment) allows components to return multiple elements without boilerplate code.
[^6]: You did think of writing tests, right? Right?
