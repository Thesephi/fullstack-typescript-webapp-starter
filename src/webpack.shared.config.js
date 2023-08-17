const webpack = require("webpack");
const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";
const mode = isDevelopment ? "development" : "production";

console.log(`webpack operating under mode \`${mode}\``);

module.exports = {

  mode,
  watch: process.env.WATCH === "true",

  // must be overwritten by client-app and server-app webpack configs
  entry: undefined,
  output: {
    path: undefined,
    filename: undefined
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    // Add '.js' so that React itself can be compiled (though this is not required during prod).
    // Add '.node' so native modules can be compiled (e.g. `unit-http`).
    extensions: [".ts", ".tsx", ".js", ".node"],
    alias: {
      shared: path.resolve(__dirname, "shared/"),
      client: path.resolve(__dirname, "client/"),
      server: path.resolve(__dirname, "server/"),
    }
  },

  module: {
    rules: [
      {
        // @TODO check if webpack@5 asset modules can replace all these additional loaders
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader"
        ]
      },
      {
        // These used to be handled by `file-loader` but are now handled by webpack@5 asset modules;
        // see https://webpack.js.org/guides/asset-modules/
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name].[ext]"
        }
      },
      {
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      // enable this (and install `node-loader` as needed) if we want to compile .node files
      // (e.g. when importing node modules with native artifacts, such as `unit-http`)
      // {
      //   test: /\.node$/,
      //   loader: "node-loader"
      // }
    ]
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode
    })
  ]

};
