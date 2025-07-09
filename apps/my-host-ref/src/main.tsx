import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Make React available globally for hoist-non-react-statics
(window as any).React = React;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);