import * as React from "react";
import { unstable_createRoot } from "react-dom";
import App from "./App";

unstable_createRoot(document.getElementById("main")!).render(<App />);

declare var module: {
    hot?: any;
}
if (module.hot) {
    // @TODO make current flow work with latest libraries, such that this error is no longer a concern:
    // Warning: You are calling ReactDOM.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it.
    module.hot.accept((err: unknown) => {
        console.error(err);
        console.log("reloading self");
        window.location.reload();
    });
}