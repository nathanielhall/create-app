const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const APP_PATH = path.resolve(__dirname, "src");

module.exports = {
  entry: APP_PATH,

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[hash].js",
    publicPath: "/",
  },
  devtool: "source-map",

  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      client: path.resolve(__dirname, "./client/"),
    },
  },

  module: {
    rules: [
      {
        test: /\.(js)x?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(APP_PATH, "index.html"),
    }),
  ],
};
