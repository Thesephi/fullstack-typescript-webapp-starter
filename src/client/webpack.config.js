const webpack = require("webpack");
const path = require("path");
const sharedConfig = require(path.resolve(__dirname, "../webpack.shared.config.js"));

module.exports = {

  ...sharedConfig,

  target: "web",

  entry: path.resolve(__dirname, "main.tsx"),

  output: {
    // path: path.resolve(__dirname, "../../build/public"),
    // filename: "js/main.js"
    path: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR,
    filename: process.env.WEBPACK_CLIENT_APP_OUTPUT_FILENAME
  },

  plugins: [
    ...(sharedConfig.plugins || []),
    new webpack.EnvironmentPlugin({
      APP_NAME: process.env.APP_NAME
    })
  ]

  /* the following optimization is disabled for the sake of simplicity for the exercise */
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // }

};
