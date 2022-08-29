const commonjs = require("@rollup/plugin-commonjs")
const { babel } = require("@rollup/plugin-babel")
const pkg = require("./package.json");

export default {
  input: "./src/parallaxy.js",
  output: [
    {
      file: pkg.main,
      name: "Parallaxy",
      format: "umd",
      sourcemap: true,
    },
  ],
  plugins: [commonjs(), babel({ babelHelpers: "bundled" })],
};