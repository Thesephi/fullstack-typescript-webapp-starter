const webpack = require("webpack");
const path = require("path");
const sharedConfig = require(path.resolve(__dirname, "../webpack.shared.config.js"));

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

  plugins: [
    ...(sharedConfig.plugins || []),
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new webpack.EnvironmentPlugin({
      BUILD_SIGNATURE: process.env.BUILD_SIGNATURE
    })
  ]

};
