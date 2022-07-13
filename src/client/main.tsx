import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import App from "./App";

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