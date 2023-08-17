import React from "react";
import { Request, Response } from "restify";
import { renderToPipeableStream } from "react-dom/server";
import { RootApp } from "shared/RootApp";
import { ExampleReactComponent } from "shared/domains/ExampleReactComponent";

export const exampleSsrReact = async (req: Request, res: Response): Promise<void> => {

  const rawFoo = req.params?.foo || "you";
  const foo = decodeURIComponent(rawFoo); // this is just an example, please use proper sanitization in a real app
  const __PRELOADED_STATE__ = { foo };

  let didError = false;
  const { pipe } = renderToPipeableStream(
    <RootApp preloadedState={__PRELOADED_STATE__} />, {
      // passing the same props used during server-rendering helps avoid
      // the error https://reactjs.org/docs/error-decoder.html/?invariant=418
      // during client-side hydration
      bootstrapScriptContent: `window.__PRELOADED_STATE__ = ${JSON.stringify(__PRELOADED_STATE__)}`,
      // entry-point js bundle that should go hand-in-hand with this server-rendered HTML
      bootstrapScripts: ["/js/root.js"],
      onShellReady() {
        // The content above all Suspense boundaries is ready.
        // If something errored before we started streaming, we set the error code appropriately.
        res.statusCode = didError ? 500 : 200;
        res.setHeader("Content-type", "text/html");
        pipe(res);
      },
      onShellError(error) {
        // Something errored before we could complete the shell so we emit an alternative shell.
        res.statusCode = 500;
        res.setHeader("Content-type", "text/html");
        // @TODO provide an example "clientrender.js" script?
        res.send('<!doctype html><p>Loading...</p><script src="clientrender.js"></script>');
      },
      onError(err) {
        didError = true;
        console.error(err);
      }
    }
  );

}
