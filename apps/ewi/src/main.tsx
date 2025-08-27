import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./global.css";

// Start MSW worker in development
if (process.env.NODE_ENV === "development") {
  const { handlers } = await import("./generated/mocks");
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
  });
  console.log("🎭 MSW started with", handlers.length, "handlers");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
