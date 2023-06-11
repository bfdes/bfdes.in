import { build } from "esbuild";

await build({
  bundle: true,
  entryPoints: ["src/main.js"],
  loader: {
    ".js": "jsx",
    ".webmanifest": "text",
    ".css": "text",
    ".webp": "binary",
    ".jpg": "binary",
    ".jpeg": "binary",
    ".png": "binary",
    ".svg": "binary",
    ".ico": "binary",
    ".ttf": "binary",
    ".woff": "binary",
    ".woff2": "binary",
  },
  outfile: "build.js",
  format: "esm",
  platform: "node",
  sourcemap: "inline",
  target: "node18",
});
