import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { serviceWorkerManager } from "./serviceWorkerManager";

import "./global.css";

// Start MSW worker with auto-recovery when mocks are enabled
// Use VITE_USE_MOCKS=true to enable mocks in any environment
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true' || 
                 (process.env.NODE_ENV === "development" && import.meta.env.VITE_USE_MOCKS !== 'false');

if (useMocks) {
  const { handlers } = await import("./generated/mocks");
  const { healthHandler } = await import("./mocks/health");
  
  try {
    await serviceWorkerManager.initialize([...handlers, healthHandler]);
    console.log("🎭 MSW mocks enabled");
  } catch (error) {
    console.error("🎭 Failed to initialize MSW after retries:", error);
    // Continue without mocks rather than blocking the app
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
