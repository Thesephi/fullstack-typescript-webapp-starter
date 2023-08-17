/**
 * example managing own WebpackDevServer
 * @TODO remove once official usage is mature
 * 
 * // import Webpack from "webpack";
 * // import WebpackDevServer from "webpack-dev-server";
 * // const webpackConfig: Webpack.Configuration = require("../src/server/webpack.config");
 *
 * // const compiler = Webpack(webpackConfig);
 * // const devServerOptions = { ...webpackConfig.devServer, open: false };
 * // const server = new WebpackDevServer(devServerOptions, compiler);
 *
 * // const runServer = async () => {
 * //   console.log("Starting server...");
 * //   await server.start();
 * // };
 *
 * // const stopServer = async () => {
 * //   console.log("Stopping server...");
 * //   await server.stop();
 * // };
 *
 * // runServer();
 *
 */


/***********************************************************************************
 * @TODO merge the logic in this file and that from webpack-dev-middleware-connector
 */

import { join, dirname } from "path";
// import vm from "node:vm";
// import cp from "node:child_process";
import { patchRequire, patchFs } from "fs-monkey";
import { ufs } from "unionfs";
import fs from "node:fs";
import initWebpackDevMiddleware, { WdmInstance } from "../src/server/webpack-dev-middleware-connector";
import somnus, { IRouteConfig } from "somnus";

let clientWdmInstanceReady: boolean = false;
let serverWdmInstanceReady: boolean = false;

function onClientWdmInstanceReady() {
  clientWdmInstanceReady = true;
  startMainServerAppOnWdmInstancesReady();
}

function onServerWdmInstanceReady() {
  serverWdmInstanceReady = true;
  startMainServerAppOnWdmInstancesReady();
}

function startMainServerAppOnWdmInstancesReady() {
  if (clientWdmInstanceReady && serverWdmInstanceReady) {
    console.log("both webpack-dev-middleware instances ready, starting main server app...");
    startMainServerApp();
  }
}

// pre-configure the DevServer app with webpack-dev-middleware instances;
// but please note that the wdm instances won"t be created until after the DevServer is started
const wdmInstances = initWebpackDevMiddleware(somnus.server);
wdmInstances?.clientSourceWebpackDevMiddleware.waitUntilValid(onClientWdmInstanceReady);
wdmInstances?.serverSourceWebpackDevMiddleware.waitUntilValid(onServerWdmInstanceReady);

let routeConfig: IRouteConfig = {

  // example of rendering HTML output using the good ol" view-template approach
  // "get /": (req: Request, res: Response) => outputView(req, res, "./view-templates/index.html"),

  // example of rendering HTML output using React SSR
  // "get /example/ssr/react/:foo": exampleSsrReact,

  // examples of simple JSON API endpoints (no HTML output)
  // "post /entry": submitEntry,
  // "get /entries": getEntries,

  // in real production, these should be intercepted & handled by a reverse proxy / CDN instead
  // "get /js/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
  // "get /css/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
  // "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: "../public" })

};

// special config for dev
if (process.env.NODE_ENV !== "production") {

  // testing webpack-dev-server serverSideRender mode, if it fails, comment this out and use the `startDevServer.ts` flow
  // const initWebpackDevMiddleware = require("./webpack-dev-middleware-connector").default;
  // initWebpackDevMiddleware(somnus.server);

  routeConfig = {
    ...routeConfig,

    // disable index serving so we can easily test out serverSideRender mode
    // https://github.com/webpack/webpack-dev-middleware/blob/c39c153919f3474f4c824a57fff92959c13ad4f3/README.md#server-side-rendering
    // "get /": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),

    "get /js/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
    "get /*hot-update.json": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
    "get /*hot-update.js": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
    "get /css/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
    "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR })

  }

}

/**
 * start the DevServer app packed with webpack-dev-middleware instances
 * for client-side and server-side resources;
 * once the DevServer app has started, the webpack-dev-middleware instances
 * shall gradually become ready (check terminal log for progresses)
 */
function startWebpackServer() {
  return new Promise((resolve) => {
    somnus.start({ routeConfig }, (addr) => {
      console.log(`DevServer started ${addr.address}:${addr.port}`);
      console.log("Please wait for webpack-dev-middleware instances to ready themselves");
      resolve(addr);
    });
  });
}

/**
 * akin to running `nodemon build/main.js`
 */
async function startMainServerApp() {
  const mainServerAppExecutablePath = wdmInstances?.serverSourceWebpackDevMiddleware.getFilenameFromUrl("/main.js");
  // memfs.fs.readFile(mainServerAppExecutablePath!, (err, data) => {
  //   console.log(err, data);
  // });
  console.log("main entry", wdmInstances?.clientSourceWebpackDevMiddleware.getFilenameFromUrl("/js/main.js"));
  console.log("root entry", wdmInstances?.clientSourceWebpackDevMiddleware.getFilenameFromUrl("/js/root.js"));

  const serverResourceOutputFileSystem = wdmInstances?.serverSourceWebpackDevMiddleware.context.outputFileSystem;
  const serverResourceJsonWebpackStats = wdmInstances?.serverSourceWebpackDevMiddleware.context.stats?.toJson();
  const { assetsByChunkName: serverResourceAssetsByChunkName, outputPath: serverResourceOutputPath } = serverResourceJsonWebpackStats!;
  console.log("serverResourceAssetsByChunkName", serverResourceAssetsByChunkName);

  const clientResourceOutputFileSystem = wdmInstances?.clientSourceWebpackDevMiddleware.context.outputFileSystem;
  const clientResourceJsonWebpackStats = wdmInstances?.clientSourceWebpackDevMiddleware.context.stats?.toJson();
  const { assetsByChunkName: clientResourceAssetsByChunkName, outputPath: clientResourceOutputPath } = clientResourceJsonWebpackStats!;
  console.log("clientResourceAssetsByChunkName", clientResourceAssetsByChunkName);
  console.log("clientResourceOutputPath", clientResourceOutputPath);

  try {

    const mainServerAppFilePath = join(serverResourceOutputPath!, "main.js");
    const mainServerAppExecutableFileContent = serverResourceOutputFileSystem?.readFileSync?.(mainServerAppFilePath, "utf8");
    console.log("reading the size of", mainServerAppFilePath, mainServerAppExecutableFileContent?.length);
    // const mainServerApp = require(mainServerAppFilePath);
    // const mainServerApp = await import(mainServerAppFilePath);
    // console.log("mainServerApp", mainServerApp);
    // console.log("mainServerApp", mainServerAppExecutableFileContent?.toString("utf8"));
    // vm.runInNewContext(mainServerAppExecutableFileContent?.toString("utf8")!);
    // eval(mainServerAppExecutableFileContent!); // works
    // cp.exec(mainServerAppExecutableFileContent!, (err, stdout, stderr) => {
    //   console.log({ err, stderr, stdout });
    // });
    // cp.fork(mainServerAppExecutableFileContent!); // spawn E2BIG
    ufs.use(clientResourceOutputFileSystem as any).use(fs);
    // await wdmMkdir(wdmInstances?.serverSourceWebpackDevMiddleware!, dirname(mainServerAppFilePath));

    // patchFs(clientResourceOutputFileSystem);

    process.env["PORT"] = "4000";
    patchRequire(serverResourceOutputFileSystem);
    require(mainServerAppFilePath);
    // console.log(require("node:util").inspect(mainServerInit), mainServerInit.default, mainServerInit.init);
    // mainServerInit(ufs);

  } catch (e) {
    console.log("failed to read main.js", e);
  }
}

async function closeWebpackDevMiddlewareInstance(wdmInstance?: WdmInstance): Promise<void | Error> {
  if (!wdmInstance) return;
  return new Promise((resolve) => {
    wdmInstance.close((err) => {
      if (err) return resolve(err);
      return resolve();
    });
  });
}

function wdmMkdir(wdmIns: WdmInstance, dirName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wdmIns.context.outputFileSystem.mkdir(dirname(dirName), (mkdirErr) => {
      if (mkdirErr) return reject(mkdirErr);
      return resolve();
    });
  })
}

process.on("SIGINT", async () => {

  const maybeClientWdmInstanceClosingError = await closeWebpackDevMiddlewareInstance(wdmInstances?.clientSourceWebpackDevMiddleware);
  const maybeServerWdmInstanceClosingError = await closeWebpackDevMiddlewareInstance(wdmInstances?.serverSourceWebpackDevMiddleware);

  maybeClientWdmInstanceClosingError &&
    console.log("error while closing webpack-dev-middleware instance for client resources", maybeClientWdmInstanceClosingError);
  maybeServerWdmInstanceClosingError &&
    console.log("error while closing webpack-dev-middleware instance for server resources", maybeServerWdmInstanceClosingError);

  console.log("\nClosing DevServer");
  somnus.stop(() => {
    console.log("DevServer stopped");
    console.log("If your terminal cursor does not show up, just press Enter");
    process.exit();
  });

});

startWebpackServer();