import path from "path";
import fs from "fs";
import restify from "restify";
// const outputFileSystem = require("memfs");
// const mkdirp = require("mkdirp");
// outputFileSystem.join = path.join.bind(path); // no need to bind
// outputFileSystem.mkdirp = mkdirp.bind(mkdirp); // no need to bind

let inited: boolean = false;

async function initWebpackDevMiddleware(app: restify.Server) {
  
  if (inited) {
    return;
  }

  if (process.env.NODE_ENV === "production") {
    // do nothing in production
    return;
  }
  
  // if (!process.env.WEBPACK_CLIENT_CONFIG) {
  //   console.log("please specify env var `WEBPACK_CLIENT_CONFIG` for webpack custom dev server");
  //   return;
  // }

  const webpack = require("webpack");
  // const config = await import(process.env.WEBPACK_CLIENT_CONFIG);
  // const configFile = fs.readFileSync(process.env.WEBPACK_CLIENT_CONFIG, "utf8");
  // const config = eval(configFile);
  // const config = require(path.resolve(process.env.WEBPACK_CLIENT_CONFIG));
  // tslint:disable-next-line
  // const config: any = await import('../client/webpack.config.js');
  // console.log("CONFIG", config);
  const config = require("../client/webpack.config.js"); // do not use `path.resolve` here
  // const config: any = {
  //   output: {
  //     mode: process.env.NODE_ENV,
  //     target: "web",
  //     publicPath: "/",
  //     entry: {
  //       main: [
  //         "webpack-hot-middleware/client?path=__webpack_hmr&timeout=2000&overlay=false",
  //         path.resolve(process.cwd(), "src/client/main.tsx")
  //         // "src/client/main.tsx"
  //       ]
  //     },
  //     resolve: {
  //       // Add '.ts' and '.tsx' as resolvable extensions.
  //       // Add '.js' is so that React itself can be compiled (though this is not required during prod).
  //       extensions: [".ts", ".tsx", ".js"],
  //       alias: {
  //         shared: path.resolve(process.cwd(), "src/shared/")
  //       }
  //     },
  //   }
  // };
  // config.plugins = [];
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

      next();
    },
    require("webpack-dev-middleware")(compiler, {
      publicPath: config.output.publicPath,
      writeToDisk: true,
      // outputFileSystem
    })
  );

  // app.get('/js/main.js', (req, res) => {
  //   console.log(compiler);
  //   return res.send(405);
  // });

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
      // log: false,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );

  inited = true;

}

export default initWebpackDevMiddleware;
