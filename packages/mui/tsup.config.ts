import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/catalog.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "@json-render/core",
    "@json-render/react",
    "@mui/material",
    "@mui/icons-material",
    "@emotion/react",
    "@emotion/styled",
    "zod",
  ],
});
