import { Request, Response } from "restify";
import { outputView, submitEntry, getEntries } from "./helper";
import somnus, { IRouteConfig } from "somnus";
import { join } from "path";

async function main(): Promise<void> {

    process.chdir(__dirname);

    somnus.server.use(somnus.restify.plugins.bodyParser());

    let routeConfig: IRouteConfig = {

        "get /": (req: Request, res: Response) => outputView(req, res, "./view-templates/index.html"),

        "post /entry": submitEntry,
        "get /entries": getEntries,

        // in real production, these should be intercepted & handled by a reverse proxy / CDN instead
        "get /js/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
        "get /css/*": somnus.restify.plugins.serveStatic({ directory: "../public" }),
        "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: "../public" })

    };

    // special config for dev
    if (process.env.NODE_ENV !== "production") {

        const initWebpackDevMiddleware = require("./webpack-dev-middleware-connector").default;
        initWebpackDevMiddleware(somnus.server);

        routeConfig = {
            ...routeConfig,

            "get /": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /js/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /*hot-update.json": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
            "get /*hot-update.js": somnus.restify.plugins.serveStatic({ directory: join(process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR!, "../") }),
            "get /css/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR }),
            "get /fonts/*": somnus.restify.plugins.serveStatic({ directory: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR })

        }

    }

    somnus.start({ routeConfig }, (addr) => {
        somnus.logger.info({ app_message: `server listening on port ${addr.port}`});

        // just so it's extra clear where to access the app
        console.log(`app ${process.env.BUILD_SIGNATURE}, server env ${process.env.NODE_ENV}, ` +
          `accessible at http://localhost:${addr.port}`);

    });

}

somnus.logger.info({ app_message: `starting up...`});
main();
