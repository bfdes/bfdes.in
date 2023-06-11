import { createStarryNight, all } from "@wooorm/starry-night";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

// Taken from https://github.com/wooorm/starry-night#example-integrate-with-unified-remark-and-rehype
const starryNightPromise = createStarryNight(all);

export default function rehypeStarryNight() {
  const prefix = "language-";

  return async function (tree) {
    const starryNight = await starryNightPromise;

    visit(tree, "element", function (node, index, parent) {
      if (!parent || index === null || node.tagName !== "pre") {
        return;
      }

      const head = node.children[0];

      if (
        !head ||
        head.type !== "element" ||
        head.tagName !== "code" ||
        !head.properties
      ) {
        return;
      }

      const classes = head.properties.className;

      if (!Array.isArray(classes)) return;

      const language = classes.find(
        (d) => typeof d === "string" && d.startsWith(prefix)
      );

      if (typeof language !== "string") return;

      const scope = starryNight.flagToScope(language.slice(prefix.length));

      if (!scope) return;

      const fragment = starryNight.highlight(toString(head), scope);
      const children = fragment.children;

      parent.children.splice(index, 1, {
        type: "element",
        tagName: "div",
        properties: {
          className: [
            "highlight",
            "highlight-" + scope.replace(/^source\./, "").replace(/\./g, "-"),
          ],
        },
        children: [
          { type: "element", tagName: "pre", properties: {}, children },
        ],
      });
    });
  };
}
