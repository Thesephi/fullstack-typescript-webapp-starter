import * as React from "react";
import { Root, unstable_createRoot } from "react-dom";
import App from "./App";

const root: Root = unstable_createRoot(document.getElementById("main")!);
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