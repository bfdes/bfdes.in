import IllegalArgumentError from "../IllegalArgumentError";
import isString from "../isString";
import Attributes from "./Attributes";
import Element from "./Element";
import Expression from "./Expression";
import Fragment from "./Fragment";
import path from "path";

export class FileSystem {
  constructor(name, content) {
    this.name = name;
    this.content = content;
  }
}

export class File extends FileSystem {
  contains(fileName) {
    return this.name == fileName;
  }
}

export class Dir extends FileSystem {
  constructor(name, content = []) {
    super(name, content);
  }

  contains(name) {
    return (
      this.name == name || this.content.some((file) => file.contains(name))
    );
  }
}

function createFile(props, children) {
  const { name } = props;
  if (!isString(name)) {
    throw new IllegalArgumentError("File names must be strings");
  }

  if (children.length !== 1) {
    throw new IllegalArgumentError(
      `File ${name} must have a single child element or string content`,
    );
  }

  const [content] = children;
  if (!(content instanceof Expression)) {
    return new File(name, content);
  }

  const ext = path.extname(name);
  switch (ext) {
    case ".html":
      return new File(name, `<!DOCTYPE html>${content}`);
    case ".xml":
    case ".rss":
      return new File(name, `<?xml version="1.0"?>${content}`);
    default:
      return new File(name, String(content));
  }
}

function createDir(props, children) {
  const { name } = props;
  if (!isString(name)) {
    throw new IllegalArgumentError("Directory names must be strings");
  }

  if (!children.every((child) => child instanceof FileSystem)) {
    throw new IllegalArgumentError(
      `Children of directory ${name} must be directory or file elements`,
    );
  }
  return new Dir(name, children);
}

export default {
  createElement(type, props, ...children) {
    props = props === null ? {} : props;
    if ("children" in props) {
      throw new IllegalArgumentError(
        "JSX children may not be passed through a named prop",
      );
    }

    children = children.flat();

    if (type === File) {
      return createFile(props, children);
    }
    if (type === Dir) {
      return createDir(props, children);
    }
    if (type === Fragment) {
      return new Fragment(children);
    }
    if (isString(type)) {
      const attributes = new Attributes(Object.entries(props));
      return new Element(type, attributes, children);
    }

    return type({
      ...props,
      children,
    });
  },
  Fragment,
};
