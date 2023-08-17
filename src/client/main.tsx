/**
 * This should be loaded into an HTML page that was NOT server-rendered by React
 */

import React from "react";
import { Root, createRoot } from "react-dom/client";
import App from "./App";

/**
 * pure client-side rendering - as opposed to SSR, which is also
 * supported in this boilerplate codebase
 */
const root: Root = createRoot(document.getElementById("main")!);
root.render(<App />);

declare var module: {
  hot?: any;
}

if (module.hot) {
  module.hot.accept("./App", (err: unknown) => {
    try {
      const NextApp = require("./App").default;
      root.render(<NextApp />);
      return;
    } catch (e) {
      console.error(e);
      // to be reloaded
    }
    console.error(err);
    console.log("reloading self");
    window.location.reload();
  });
}