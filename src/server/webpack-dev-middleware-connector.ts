import restify from "restify";
import path from "path";
import webpackDevMiddleware, { API, IncomingMessage, ServerResponse } from "webpack-dev-middleware";

export type WdmInstance = API<IncomingMessage, ServerResponse>;

let inited: boolean = false;
let clientSourceWebpackDevMiddleware: WdmInstance;
let serverSourceWebpackDevMiddleware: WdmInstance;

function isObject(x: any) {
  return typeof x === "object" && x !== null;
}

// This function makes server rendering of asset references consistent with different webpack chunk/entry configurations
function normalizeAssets(assets: any) {
  if (isObject(assets)) {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

function initWebpackDevMiddleware(app: restify.Server) {

  if (process.env.NODE_ENV === "production") {
    // do nothing in production
    return;
  }

  if (inited) {
    return {
      clientSourceWebpackDevMiddleware,
      serverSourceWebpackDevMiddleware
    };
  }

  const webpack = require("webpack");
  const clientConfig = require("../client/webpack.config.js"); // do not use `path.resolve` here
  const clientCompiler = webpack(clientConfig);
  const serverConfig = require("../server/webpack.config.js"); // do not use `path.resolve` here
  const serverCompiler = webpack(serverConfig);

  somnusWdmWhmCompatibilityFix(app);

  clientSourceWebpackDevMiddleware = webpackDevMiddleware(clientCompiler, {
    // https://github.com/webpack/webpack-dev-middleware#options
    publicPath: clientConfig.output.publicPath,
    writeToDisk: false
  });

  app.use(clientSourceWebpackDevMiddleware);

  serverSourceWebpackDevMiddleware = webpackDevMiddleware(serverCompiler, {
    // https://github.com/webpack/webpack-dev-middleware#options
    publicPath: serverConfig.output.publicPath,
    writeToDisk: false,
    serverSideRender: true
  });

  app.use(serverSourceWebpackDevMiddleware);

  // requests for `.js`, `.js.map` and `/webpack_hmr` shall pass thru this
  app.pre(
    (req, res, next) => {
      const thePath = req.getPath();
      const theBareQuery = req.getQuery();
      const theQuery = theBareQuery ? `?${theBareQuery}` : "";
      const theUrl = thePath + theQuery;
      console.log("somnus wdmwhm: handling", theUrl);
      // fix a webpack-hot-middleware - restify incompatibility
      // @TODO ensure the fix is cherry-picked to v2
      req.url = theUrl;
      return next();
    },
    require("webpack-hot-middleware")(clientCompiler, {
      // https://github.com/webpack-contrib/webpack-hot-middleware#middleware
      log: console.log,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );

  app.get('/test', (req, res) => {
    const outputFileSystem = serverSourceWebpackDevMiddleware.context.outputFileSystem;
    const jsonWebpackStats = serverSourceWebpackDevMiddleware.context.stats?.toJson();
    const { assetsByChunkName, outputPath } = jsonWebpackStats!;
    console.log('assetsByChunkName', assetsByChunkName);
    try {
      const mainServerAppExecutableFileContent = outputFileSystem.readFileSync?.(path.join(outputPath!, 'main.js'));
      console.log('reading main.js size', mainServerAppExecutableFileContent?.length);
    } catch (e) {
      console.log('failed to read main.js', e);
    }
    res.send(assetsByChunkName);
  })

  // The following middleware would not be invoked until the latest build is finished.
  // app.use((req, res) => {
  //   const { devMiddleware } = (res as any).locals.webpack;
  //   console.log(devMiddleware);
  //   const outputFileSystem = devMiddleware.context.outputFileSystem;
  //   const jsonWebpackStats = devMiddleware.context.stats.toJson();
  //   const { assetsByChunkName, outputPath } = jsonWebpackStats;

  //   // Then use `assetsByChunkName` for server-side rendering
  //   // For example, if you have only one main chunk:
  //   res.send(`
  //     <html>
  //       <head>
  //         <title>My DevServer-backed App</title>
  //         <style>
  //         ${normalizeAssets(assetsByChunkName.main)
  //           .filter((path) => path.endsWith(".css"))
  //           .map((path) => outputFileSystem.readFileSync(path.join(outputPath, path)))
  //           .join("\n")}
  //         </style>
  //       </head>
  //       <body>
  //         <div id="root"></div>
  //         ${normalizeAssets(assetsByChunkName.main)
  //           .filter((path) => path.endsWith(".js"))
  //           .map((path) => `<script src="${path}"></script>`)
  //           .join("\n")}
  //       </body>
  //     </html>
  //   `);
  // });

  inited = true;

  return {
    clientSourceWebpackDevMiddleware,
    serverSourceWebpackDevMiddleware
  }

}

/**
  * @TODO see if we can narrow this rule further (e.g. with a fn param)
  * example: see how we do it for `app.formatters["application/json"]` (below);
  * the idea is to handle the minimum needed to make our setup work with
  * `webpack-hot-module` and `webpack-dev-middleware`
  */
function createResponseFormatter(mimeType: string) {
  return (req: restify.Request, res: restify.Response, body: any) => {
    console.log(`somnus wdm: ${mimeType} explicit handling`);
    res.set({ "Content-Type": mimeType });
    if (body instanceof Error) return body.stack;
    return Buffer.isBuffer(body) ? body.toString("utf8") : body;
  };
}

function somnusWdmWhmCompatibilityFix(app: restify.Server): void {

  console.debug("existing restify server formatters", app.formatters);

  app.formatters["application/javascript"] = createResponseFormatter("application/javascript");

  app.formatters["text/css"] = createResponseFormatter("text/css");
  app.formatters["image/x-icon"] = createResponseFormatter("image/x-icon");
  app.formatters["font/woff"] = createResponseFormatter("font/woff");
  app.formatters["font/woff2"] = createResponseFormatter("font/woff2");

  const defaultJsonFormatter = app.formatters["application/json"];
  app.formatters["application/json"] = (req, res, body) => {
    const thePath = req.getPath();
    // serving webpack-hot-middleware json files
    if (thePath.endsWith("hot-update.json")) {
      console.log("somnus wdm: custom application/json handling");
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

}

export default initWebpackDevMiddleware;
