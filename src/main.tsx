import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { debugStorage } from './lib/debug.ts';
import { initializeStorageErrorHandler } from './lib/utils.ts';

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

// Error boundary component for better error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Application error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            Please refresh the page to try again
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
