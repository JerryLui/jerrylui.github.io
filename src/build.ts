import * as esbuild from "npm:esbuild";

// Build main Three.js homepage
await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  minify: true,
  outfile: "docs/main.js",
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  external: ["three"],
});

// Build consulting page
await esbuild.build({
  entryPoints: ["src/consulting.ts"],
  bundle: true,
  minify: true,
  outfile: "docs/consulting.js",
  format: "esm",
  platform: "browser",
  target: ["es2020"],
});
