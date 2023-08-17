const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const sharedConfig = require("../webpack.shared.config.js"); // do not use `path.resolve` here

const isDevelopment = sharedConfig.mode !== "production";

module.exports = {

  ...sharedConfig,
  
  target: "node",
  
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  },

  entry: path.resolve(__dirname, "main.ts"),

  output: {
    path: process.env.WEBPACK_SERVER_APP_OUTPUT_DIR,
    filename: process.env.WEBPACK_SERVER_APP_OUTPUT_FILENAME
  },

  externals: {
    // we only need `react-refresh-webpack-plugin` during development, so it is
    // desirable to mark it as external lest our server-side module fails to compile
    "@pmmmwh/react-refresh-webpack-plugin": "@pmmmwh/react-refresh-webpack-plugin"
  },
  
  module: {
    ...sharedConfig.module,
    rules: [
      ...sharedConfig.module.rules,
      // {
      //   // @TODO check if webpack@5 asset modules can replace all these additional loaders
      //   test: /\.s[ac]ss$/i,
      //   use: [
      //     // strip CSS from output bundle, a MUST HAVE to deal with SSR
      //     // where the React component imports .scss files
      //     MiniCssExtractPlugin.loader,

      //     // Translates CSS into CommonJS
      //     "css-loader",

      //     // Compiles Sass to CSS
      //     "sass-loader"
      //   ]
      // },
      {
        test: /\.ts(x?)$/,
        exclude: [
          /node_modules/
        ],
        use: [
          "ts-loader"
        ]
      }
    ]
  },

  plugins: [
    ...(sharedConfig.plugins || []),
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new webpack.EnvironmentPlugin({
      BUILD_SIGNATURE: process.env.BUILD_SIGNATURE
    }),
    // // this is here (instead of `webpack.shared.config`) because of the way we include & configure it
    // new MiniCssExtractPlugin({
    //   // Options similar to the same options in webpackOptions.output
    //   // all options are optional
    //   filename: "css/[name].css",
    //   chunkFilename: "css/[id].css",
    //   // Enable to remove warnings about conflicting order
    //   // ignoreOrder: false,
    // }),
  ]

};
