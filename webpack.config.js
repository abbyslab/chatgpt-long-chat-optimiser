const path = require("path");

const alias = {
  "@components": path.resolve(__dirname, "src/components"),
  "@managers": path.resolve(__dirname, "src/managers"),
  "@utils": path.resolve(__dirname, "src/utils"),
  "@content": path.resolve(__dirname, "src/content"),
  "@config": path.resolve(__dirname, "src/config"),
};

module.exports = {
  mode: "production",
  entry: {
    content_script: "./src/content/content-script.ts",
    background: "./src/background/background.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
    clean: true,
  },
  target: "web",
  resolve: {
    alias,
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
