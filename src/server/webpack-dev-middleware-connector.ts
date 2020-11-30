import restify from "restify";

let inited: boolean = false;

async function initWebpackDevMiddleware(app: restify.Server) {
  
  if (inited) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    // do nothing in production
    return;
  }

  const webpack = require("webpack");
  const config = require("../client/webpack.config.js"); // do not use `path.resolve` here
  const compiler = webpack(config);

  app.use(
    (req, res, next) => {

      // console.log("formatters");
      // console.log(app.formatters);

      app.formatters["application/javascript"] = (req, res, body) => {
        console.log("somnus: custom application/javascript handling");
        res.set({ 'Content-Type': "text/javascript" });
        if (body instanceof Error) return body.stack;
        return Buffer.isBuffer(body) ? body.toString('utf8') : body;
      };

      app.formatters["application/json"] = (req, res, body) => {
        console.log("somnus: custom application/json handling");
        if (body instanceof Error) return body.stack;
        return typeof body === "string" ? JSON.parse(body) : body;
      };

      // @TODO what about font files?

      next();
    },
    require("webpack-dev-middleware")(compiler, {
      // https://github.com/webpack/webpack-dev-middleware#options
      publicPath: config.output.publicPath,
      writeToDisk: true
    })
  );

  // requests for `.js`, `.js.map` and `/webpack_hmr` shall pass thru this
  app.pre(
    (req, res, next) => {
      const thePath = req.getPath();
      console.log("somnus: custom whm handling", thePath);
      // fix a webpack-hot-middleware - restify incompatibility
      req.url = thePath;
      return next();
    },
    require("webpack-hot-middleware")(compiler, {
      // https://github.com/webpack-contrib/webpack-hot-middleware#middleware
      // log: false,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );

  inited = true;

}

export default initWebpackDevMiddleware;
