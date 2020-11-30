// interface ISimpleServerApp {
//   use: Function;
// }

let inited = false;

function initWebpackDevMiddleware(app) {
  
  if (inited) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    // do nothing in production
    return;
  }

  const webpack = require("webpack");
  const config = require("../client/webpack.config.js"); // do not use `path.resolve` here
  config.plugins = [];
  const compiler = webpack(config);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      publicPath: config.output.publicPath
    })
  );

  app.use(
    require("webpack-hot-middleware")(compiler, {
      // log: false,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );

  inited = true;

}

module.exports = initWebpackDevMiddleware;
