import { Next, Request, Response } from "restify";
import { outputView, submitEntry, getEntries } from "./helper";
import somnus, { IRouteConfig } from "somnus";
import { join } from "path";
import { exampleSsrReact } from "server/request-handlers/example-ssr-react";

let proxy: any;
async function createServingProxyForDevMode() {
  if (process.env.NODE_ENV === "production") return;
  // app dev mode run on :4000, requests served by webpack-dev-server on :3000,
  // hence the need for proxying
  proxy = (await import("http-proxy")).default.createProxyServer({
    target: "http://127.0.0.1:3000" // @TODO make this dynamic
  });
}

// special setup for dev mode (`npm run dev`)
function handleClientResourcesFromWdm(req: Request, res: Response, next: Next) {
  // res.send(devFileSystem?.readFileSync("/js/root.js", "utf8")); // @TODO handle ?.
  // 18.06.23 TEST PROXYING TO OUR WebpackDevServer
  // @TODO do actual proxying instead of redirecting
  // return res.redirect(302, `http://localhost:3000${req.url}`, next);
  // const resp = await fetch(`http://localhost:3000/${req.url}`);  // @TODO pipe
  // return res.send(resp.body);

  // 17.08.23
  if (proxy) {
    proxy.web(req, res);
  }
}

async function main(devFileSystem?: any): Promise<void> {

  try {
    process.chdir(__dirname);
  } catch (e) {
    console.log("warning: failed to chdir into", __dirname);
    console.log("effective dirname", __dirname);
  }

  let routeConfig: IRouteConfig = {

    // example of rendering HTML output using the good ol' view-template approach
    "get /": (req: Request, res: Response) => outputView(req, res, "./view-templates/index.html"),

    // example of rendering HTML output using React SSR
    "get /example/ssr/react/:foo": exampleSsrReact,

    // examples of simple JSON API endpoints (no HTML output)
    "post /entry": submitEntry,
    "get /entries": getEntries,

    // in real production, these should be intercepted & handled by a reverse proxy / CDN instead
    "get /js/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
    "get /css/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
    "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: "../public" })

  };

  if (process.env.NODE_ENV !== "production") {

    await createServingProxyForDevMode();

    // testing webpack-dev-server serverSideRender mode, if it fails, comment this out and use the `startDevServer.ts` flow
    // const initWebpackDevMiddleware = require("./webpack-dev-middleware-connector").default;
    // initWebpackDevMiddleware(somnus.server);

    routeConfig = {
      ...routeConfig,

      // systematically "route" wdm client-side resources to the memfs managed by DevServer (webpack-dev-middleware)
      "get /": handleClientResourcesFromWdm, // @TODO don't route /
      "get /js/*": handleClientResourcesFromWdm,
      "get /*hot-update.json": handleClientResourcesFromWdm,
      "get /*hot-update.js": handleClientResourcesFromWdm,
      "get /css/*": handleClientResourcesFromWdm,
      "get /fonts/*": handleClientResourcesFromWdm,
      // "get /": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
      // "get /js/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
      // "get /*hot-update.json": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
      // "get /*hot-update.js": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
      // "get /css/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
      // "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR })

    }

  }

  somnus.start({ routeConfig }, (addr) => {
    somnus.logger.info({ app_message: `server listening on port ${addr.port}` });

    // just so it's extra clear where to access the app
    console.log(`app ${process.env.BUILD_SIGNATURE}, server env ${process.env.NODE_ENV}, ` +
      `accessible at http://localhost:${addr.port}`);

  });

}

// export const init = (devFileSystem?: any) => {
//   somnus.logger.info({ app_message: `starting up...` });
//   main(devFileSystem);
// }

somnus.logger.info({ app_message: `starting up...` });
main();
