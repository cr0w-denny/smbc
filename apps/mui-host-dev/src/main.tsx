import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Swagger CSS will be loaded dynamically by ApiDocsWrapper when needed

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
