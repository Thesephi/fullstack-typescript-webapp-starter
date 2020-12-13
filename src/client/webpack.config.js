const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const sharedConfig = require("../webpack.shared.config.js"); // do not use `path.resolve` here

const isDevelopment = sharedConfig.mode !== "production";

module.exports = {

  ...sharedConfig,

  context: __dirname,

  target: "web",

  // if using webpack-hot-middleware
  entry: {
    main: [
      // https://github.com/webpack-contrib/webpack-hot-middleware#config
      isDevelopment && "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true",
      path.resolve(__dirname, "./main.tsx")
    ].filter(Boolean)
  },

  output: {
    // path: path.resolve(__dirname, "../../build/public"),
    // filename: "js/main.js"
    path: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR,
    filename: process.env.WEBPACK_CLIENT_APP_OUTPUT_FILENAME,
    publicPath: "/"
  },
  
  module: {
    ...sharedConfig.module,
    rules: [
      ...sharedConfig.module.rules,
      {
        // only for webpack@5
        // https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(t|j)s(x?)$/,
        exclude: /node_modules/,
        use: [
          isDevelopment && {
            loader: "babel-loader",
            options: { plugins: ["react-refresh/babel"] }
          },
          {
            loader: "ts-loader",
            options: { transpileOnly: true }
          }
        ].filter(Boolean)
      }
    ]
  },

  plugins: [
    ...(sharedConfig.plugins || []),
    new webpack.EnvironmentPlugin({
      APP_NAME: process.env.APP_NAME || ""
    }),
    new HtmlWebpackPlugin({
      // @NOTE inject build-time vars as needed
      filename: isDevelopment

        // to be served by `get /` from the server-side module during development
        // (served from memory)
        ? "index.html"

        // built into a physical `index.html` file in the dist dir for production
        : path.resolve(__dirname, "../../build/server/view-templates/index.html"),

      template: path.resolve(__dirname, "../server/view-templates/index.html"),
      publicPath: "/",
      templateParameters: {
        title: process.env.APP_NAME
      }
    }),
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshPlugin({
      overlay: {
        sockIntegration: "whm",
      }
    })
  ].filter(Boolean)

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
