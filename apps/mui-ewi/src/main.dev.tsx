import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.dev";
import { serviceWorkerManager } from "./mocks/manager";

import "./global.css";

// Start MSW worker with auto-recovery when mocks are enabled
// Use VITE_USE_MOCKS=true to enable mocks in any environment
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true' ||
                 (process.env.NODE_ENV === "development" && import.meta.env.VITE_USE_MOCKS !== 'false');

if (useMocks) {
  const { handlers } = await import("./generated/mocks");
  const { handlers: appHandlers } = await import("./mocks/handlers");

  try {
    await serviceWorkerManager.initialize([...handlers, ...appHandlers]);
    console.log("🎭 MSW mocks enabled");
  } catch (error) {
    console.error("🎭 Failed to initialize MSW after retries:", error);
    // Continue without mocks rather than blocking the app
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);