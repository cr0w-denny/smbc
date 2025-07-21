import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// AG-Grid Quartz theme CSS and required fonts
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";

// Swagger CSS will be loaded dynamically by ApiDocsWrapper when needed

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
