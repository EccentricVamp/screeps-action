"use strict";

import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    interop: "esModule"
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json" })
  ]
}