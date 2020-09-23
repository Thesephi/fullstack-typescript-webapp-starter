import * as React from "react";
import { unstable_createRoot } from "react-dom";
import App from "./App";

unstable_createRoot(document.getElementById("main")!).render(<App />);