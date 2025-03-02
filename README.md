# [bfdes.in](https://bfdes.in)

[![GitHub Actions](https://github.com/bfdes/bfdes.in/actions/workflows/build.yml/badge.svg)](https://github.com/bfdes/bfdes.in/actions/workflows/build.yml)
[![Codecov](https://codecov.io/gh/bfdes/bfdes.in/branch/master/graph/badge.svg)](https://codecov.io/gh/bfdes/bfdes.in)

Static site generator and markup for my blog.

This SSG is written in JavaScript and runs under the Bun runtime. The project requires two build steps. The first build step uses Bun as a bundler to transpile a JSX-based filesystem description of the blog. It writes a portable script to disk. The second build step runs the script under Bun. It consumes markup from the current working directory to build the blog.

## Usage

### Requirements

- [Bun](https://bun.sh) v1.2

Run the following commands within the repository root:

```
bun install
# Installs all dependencies

bun run publish
# Builds the blog and puts it under /site
```

### Editing posts

Enter Markdown articles in the posts directory with the following structure:

```
---
title: <TITLE>
tags: <TAG1> <TAG2>
created: <YEAR>-<MONTH>-<DAY>
summary: <RSS SUMMARY>
---
<BODY IN MARKDOWN>
```

### Supported markup

GitHub-Flavoured Markdown is supported, with embedded math and code fragments.

- Wrap inline math in `$`, and block math in `$$`
- Wrap code in ` ``` `

For example, the snippet

````
# Complex numbers

Python supports complex numbers natively. For example, $1 + 2*j$ is written as

```python
1 + 2j
```
````

presents inline math, delimited by `$`, and fenced code blocks, delimited by ` ``` `.

### Testing

Run the following commands to format and test code:

```
bun format
bun test
```

[GitHub Actions](https://github.com/bfdes/bfdes.in/actions) will run tests for every code push.

## Deployment

The output of `bun run publish` can be

1. served by a web server such as [NGINX](https://www.nginx.com/), or
2. hosted by a platform like [GitHub Pages](https://pages.github.com/).

A web server, like the one from Python's `http.server` module, can be used to preview the blog during development:

```
python3 -m http.server -d site
# Serves the content of the site folder on localhost:8000
```
