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

  somnusWdmWhmCompatibilityFix(app);

  app.use(require("webpack-dev-middleware")(compiler, {
      // https://github.com/webpack/webpack-dev-middleware#options
      publicPath: config.output.publicPath,
      writeToDisk: false
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

function somnusWdmWhmCompatibilityFix(app: restify.Server): void {

  // console.debug("formatters", app.formatters);

  app.formatters["application/javascript"] = (req, res, body) => {
    console.log("somnus: custom application/javascript handling");
    res.set({ "Content-Type": "text/javascript" });
    if (body instanceof Error) return body.stack;
    // @TODO see if we can narrow this rule further down,
    // like we currently do it for the json formatter below
    // (the idea is to handle the minimum needed to make our setup work with
    // `webpack-hot-module` and `webpack-dev-middleware`)
    return Buffer.isBuffer(body) ? body.toString("utf8") : body;
  };

  const defaultJsonFormatter = app.formatters["application/json"];
  app.formatters["application/json"] = (req, res, body) => {
    const thePath = req.getPath();
    // serving webpack-hot-middleware json files
    if (thePath.endsWith("hot-update.json")) {
      console.log("somnus: custom application/json handling");
      if (body instanceof Error) return body.stack;
      return typeof body === "string" ? JSON.parse(body) : body;
    }
    // for any case other than serving webpack-hot-middleware json files
    return defaultJsonFormatter(req, res, body);
  };

  const defaultHtmlFormatter = app.formatters["text/html"];
  app.formatters["text/html"] = (req, res, body) => {

    // somnus doesn't add this header by default, so we do it manually here
    res.set({ "Content-Type": "text/html" });

    return defaultHtmlFormatter != null
      ? defaultHtmlFormatter(req, res, body)
      : body;
  };

  // @TODO investigate if we need any special logic to support font files?

}

export default initWebpackDevMiddleware;
