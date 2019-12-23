import path from "path";

const config = {
  entry: "./src/scripts/main.js",
  output: {
    path: path.resolve(__dirname, "../build/assets/scripts"),
  },
  context: path.resolve(__dirname, "../"),
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          fix: true
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dom7|swiper)\/).*/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: ["@babel/preset-env"]
          }
        }
      },
    ]
  },
  resolve: {
    alias: {
      Helpers: path.resolve(__dirname, "../src/scripts/helpers"),
      Components: path.resolve(__dirname, "../src/components/")
    },
    extensions: [".js", ".jsx"]
  }
}

module.exports = { config };
