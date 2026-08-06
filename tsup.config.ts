import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
  },
  {
    entry: {
      "browserdb.global": "src/index.ts",
    },
    format: ["iife"],
    globalName: "BrowserDB",
    noExternal: ["uuid"],
    minify: true,
    sourcemap: true,
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
]);
