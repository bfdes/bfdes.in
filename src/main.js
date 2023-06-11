import IllegalArgumentError from "./IllegalArgumentError";
import Router from "./Router";
import { Dir } from "./jsx";
import ls from "./ls";
import { parse } from "./md";
import mk from "./mk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const markupPath = path.join(__dirname, "posts");
const dir = await ls(markupPath);
if (!(dir instanceof Dir)) {
  throw new IllegalArgumentError(`${markupPath} must point to a directory`);
}
const markup = dir.content.filter((file) => path.extname(file.name) == ".md");
const posts = await Promise.all(markup.map(parse));
const site = Router(posts);
await mk(site);
