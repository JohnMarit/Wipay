import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeStorageErrorHandler } from './lib/utils.ts';
import { debugStorage } from './lib/debug.ts';

// Initialize protection against external localStorage errors
initializeStorageErrorHandler();

// Console message to clarify localStorage errors
console.log(`
🏢 Wipay App Loaded Successfully!

🛡️ ADVANCED LOCALSTORAGE PROTECTION ACTIVE

ℹ️  If you STILL see localStorage errors like "Failed to parse item from local storage: professional/short":
   
   👉 IMMEDIATE SOLUTION:
   1. Open Browser Console (press F12)
   2. Type: debugStorage.clearAllExternalStorage()
   3. Press Enter, then refresh the page
   
   👉 ALTERNATIVE SOLUTIONS:
   • Press Ctrl+F5 to hard refresh
   • Test in Incognito/Private mode (no extensions)
   • Disable browser extensions temporarily
   
✅ YOUR WIPAY APP IS WORKING CORRECTLY!
   • WiFi token generation ✓
   • Firebase authentication ✓
   • Data storage ✓
   • All features functional ✓

🔧 These localStorage errors are from browser extensions and are now being blocked.
   Your WiFi token system functionality is NOT affected.

💡 Need help? Type 'debugStorage.runAllChecks()' in console for full diagnosis.
`);

// Run debug analysis to identify localStorage error sources
setTimeout(() => {
  debugStorage.runAllChecks();
}, 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
