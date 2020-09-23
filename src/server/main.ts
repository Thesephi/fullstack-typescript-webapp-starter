import { Request, Response } from "restify";
import { outputView, submitEntry, getEntries } from "./helper";
import somnus from "somnus";

async function main(): Promise<void> {

    process.chdir(__dirname);

    somnus.server.use(somnus.restify.plugins.bodyParser());

    somnus.start({
        routeConfig: {

            "get /": (req: Request, res: Response) => outputView(req, res, "./view-templates/index.html"),

            "post /entry": submitEntry,
            "get /entries": getEntries,

            // just during dev, for prod, a reverse proxy is better
            "get /js/*": somnus.restify.plugins.serveStatic({ directory: "../public/" }),
            "get /css/*": somnus.restify.plugins.serveStatic({ directory: "../public/" })

        }
    }, (addr) => {
        somnus.logger.info({ app_message: `server listening on port ${addr.port}`});

        // just so it's extra clear where to access the app
        console.log(`app accessible at http://localhost:${addr.port}`);

    });

}

somnus.logger.info({ app_message: `starting up...`});
main();