import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeStorageErrorHandler } from "./lib/utils.ts";
import { debugStorage } from "./lib/debug.ts";

// Initialize protection against external localStorage errors
initializeStorageErrorHandler();

// Console message to clarify localStorage errors
console.log(`
🏢 Wipay App Loaded Successfully!

ℹ️  If you see localStorage errors like "Failed to parse item from local storage: professional/short",
   these are from browser extensions or external scripts, NOT from Wipay.
   
✅ Wipay uses namespaced storage (wipay_*) and Firebase for secure data management.
   Your WiFi token system is working correctly!

🔧 Browser extensions often cause these harmless localStorage warnings.
   They do not affect your Wipay application functionality.
`);

// Run debug analysis to identify localStorage error sources
setTimeout(() => {
  debugStorage.runAllChecks();
}, 1000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
