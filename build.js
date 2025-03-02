await Bun.build({
  entryPoints: ["src/publish.js"],
  loader: {
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
  outdir: ".",
  target: "bun",
});
