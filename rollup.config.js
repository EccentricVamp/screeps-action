"use strict";

import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "cjs",
    interop: "esModule",
    exports: "auto"
  },
  plugins: [
    commonjs(),
    json(),
    resolve(),
    typescript()
  ]
};

export default config;