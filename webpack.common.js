const path = require("path");

const alias = {
  "@components": path.resolve(__dirname, "src/components"),
  "@managers": path.resolve(__dirname, "src/managers"),
  "@utils": path.resolve(__dirname, "src/utils"),
  "@content": path.resolve(__dirname, "src/content"),
  "@config": path.resolve(__dirname, "src/config"),
  "@styles": path.resolve(__dirname, "src/styles")
};

module.exports = {
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
    extensions: [".ts", ".js", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
          },
        ],
      },
    ],
  },
};
