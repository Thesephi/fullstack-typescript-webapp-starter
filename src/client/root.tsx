/**
 * This should be loaded into an HTML page that was server-rendered by React (via `withRootApp`)
 */

import React from "react";
import { hydrateRoot } from "react-dom/client";
import { RootApp } from "shared/RootApp";
// import { ExampleReactComponent } from "shared/domains/ExampleReactComponent";

declare var window: Window & {
  __PRELOADED_STATE__: any;
}

const preloadedState = window.__PRELOADED_STATE__;

hydrateRoot(document, <RootApp preloadedState={preloadedState} />);