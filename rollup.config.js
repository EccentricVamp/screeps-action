"use strict";

import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    interop: "esModule"
  },
  plugins: [typescript({ tsconfig: "./tsconfig.json" })]
}