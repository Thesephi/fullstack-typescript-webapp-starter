const webpack = require("webpack");
const path = require("path");
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
    })
  ]

};
