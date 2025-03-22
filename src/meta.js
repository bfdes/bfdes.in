import IllegalArgumentError from "./IllegalArgumentError";
import isString from "./isString";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

export class FrontmatterParseError extends IllegalArgumentError {
  constructor(fileName) {
    super(`Invalid YAML frontmatter in ${fileName}`);
  }
}

export class MissingFrontmatterError extends IllegalArgumentError {
  constructor(fileName) {
    super(`Frontmatter missing from ${fileName}`);
  }
}

export class MissingMetadataKeysError extends IllegalArgumentError {
  constructor(fileName, keys) {
    super(
      `Required metadata ${keys.length > 1 ? "keys" : "key"} ${keys
        .map((key) => `"${key}"`)
        .join(", ")} missing from ${fileName}`,
    );
  }
}

export class InvalidMetadataKeysError extends IllegalArgumentError {
  constructor(fileName, keys) {
    super(
      `Invalid metadata ${keys.length > 1 ? "keys" : "key"} ${keys
        .map((key) => `"${key}"`)
        .join(", ")} in ${fileName}`,
    );
  }
}

const schema = {
  title: isString,
  summary: isString,
  tags: (value) => Array.isArray(value) && value.every(isString),
  created: (value) => value instanceof Date,
};

export function parse(file) {
  const vfile = new VFile(file.content);

  const parseOptions = {
    customTags: [
      "timestamp", // Parse datetime fields according to YAML 1.1 spec
    ],
  };
  matter(vfile, { strip: true, yaml: parseOptions });

  const frontmatter = vfile.data.matter;

  const isInvalid = isString(frontmatter);
  if (isInvalid) {
    throw new FrontmatterParseError(file.name);
  }

  const isMissing = Object.keys(frontmatter).length == 0;
  if (isMissing) {
    throw new MissingFrontmatterError(file.name);
  }

  // Schema validation. Adapted from https://stackoverflow.com/a/38616988.
  const schemaKeys = Object.keys(schema);

  const missingKeys = schemaKeys.filter((key) => !(key in frontmatter));
  if (missingKeys.length) {
    throw new MissingMetadataKeysError(file.name, missingKeys);
  }

  const invalidKeys = schemaKeys.filter(
    (key) => !schema[key](frontmatter[key]),
  );
  if (invalidKeys.length) {
    throw new InvalidMetadataKeysError(file.name, invalidKeys);
  }

  return frontmatter;
}
