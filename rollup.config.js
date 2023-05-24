const ts = require("rollup-plugin-ts");
const pkg = require("./package.json");

export default {
  input: "./src/index.ts",
  output: [
    {
      file: pkg.main,
      name: "Parallaxy",
      format: "umd",
      sourcemap: true,
    },
  ],
  plugins: [ts()],
};
