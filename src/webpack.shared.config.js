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
    // Add '.js' is so that React itself can be compiled (though this is not required during prod).
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      shared: path.resolve(__dirname, "shared/")
    }
  },

  module: {
    rules: [
      {
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
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          outputPath: "fonts"
        }
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode
    })
  ]

};
