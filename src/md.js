import * as meta from "./meta";
import slugify from "./slugify";
import rehypeKatex from "rehype-katex";
import rehypeStarryNight from "rehype-starry-night";
import rehypeStringify from "rehype-stringify";
import remarkGemoji from "remark-gemoji";
import remarkGFM from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

function remarkCount() {
  this.Compiler = countWords;

  function countWords(tree) {
    if (tree.type == "text") {
      return tree.value.trim().split(/\s+/).length;
    }
    return (tree.children || [])
      .map(countWords)
      .reduce((sum, count) => sum + count, 0);
  }
}

export async function parse(file) {
  const { title, summary, tags, created } = meta.parse(file);

  const slug = slugify(title);

  let vfile = new VFile(file.content);
  matter(vfile, { strip: true });

  const body = await unified()
    .use(remarkParse)
    .use(remarkGemoji)
    .use(remarkGFM)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeStarryNight)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(vfile)
    .then((vfile) => vfile.toString());

  vfile = new VFile(file.content);
  matter(vfile, { strip: true });

  const wordCount = await unified()
    .use(remarkParse)
    .use(remarkGemoji)
    .use(remarkGFM)
    .use(remarkMath)
    .use(remarkCount)
    .process(vfile)
    .then((vfile) => vfile.result);

  return {
    title,
    slug,
    summary,
    tags,
    wordCount,
    body,
    created,
  };
}
