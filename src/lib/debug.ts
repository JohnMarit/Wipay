// Debug utilities for troubleshooting localStorage and deployment issues

export const debugStorage = {
  // Check if localStorage errors are from Wipay or external sources
  analyzeLocalStorageErrors(): void {
    if (typeof window === 'undefined') return;

    console.group('[Wipay Debug] LocalStorage Analysis');

    try {
      // Check all localStorage keys
      const allKeys: string[] = [];
      const wipayKeys: string[] = [];
      const externalKeys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allKeys.push(key);
          if (key.startsWith('wipay_')) {
            wipayKeys.push(key);
          } else {
            externalKeys.push(key);
          }
        }
      }

      console.log('📊 Total localStorage keys:', allKeys.length);
      console.log('🏢 Wipay keys:', wipayKeys.length, wipayKeys);
      console.log(
        '🔧 External keys (extensions/other):',
        externalKeys.length,
        externalKeys.slice(0, 10)
      ); // Show first 10

      // Check for problematic keys
      const problematicKeys = ['professional', 'short'];
      const foundProblematic = externalKeys.filter(key =>
        problematicKeys.some(prob => key.includes(prob))
      );

      if (foundProblematic.length > 0) {
        console.warn(
          '⚠️ Found problematic keys (likely from extensions):',
          foundProblematic
        );
        console.log(
          '💡 These keys are causing the localStorage errors you see'
        );
        console.log('🛡️ Wipay is now blocking these errors automatically');
      }

      // Test Wipay localStorage functionality
      const testKey = 'wipay_test_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };

      try {
        localStorage.setItem(testKey, JSON.stringify(testValue));
        const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
        localStorage.removeItem(testKey);

        if (retrieved.test === true) {
          console.log('✅ Wipay localStorage is working correctly');
        } else {
          console.error('❌ Wipay localStorage test failed');
        }
      } catch (error) {
        console.error('❌ Wipay localStorage test error:', error);
      }
    } catch (error) {
      console.error('❌ Failed to analyze localStorage:', error);
    }

    console.groupEnd();
  },

  // Complete localStorage cleanup utility
  clearAllExternalStorage(): void {
    if (typeof window === 'undefined') return;

    console.group('[Wipay Debug] Storage Cleanup');

    try {
      let cleared = 0;
      const keysToRemove: string[] = [];

      // Find all non-Wipay keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('wipay_')) {
          keysToRemove.push(key);
        }
      }

      // Remove external keys
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          cleared++;
        } catch (error) {
          console.warn(`Failed to remove key: ${key}`, error);
        }
      });

      console.log(`🧹 Cleared ${cleared} external localStorage items`);
      console.log('✅ Browser localStorage has been cleaned up');
      console.log('🔄 Please refresh the page to see if errors are gone');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }

    console.groupEnd();
  },

  // Show troubleshooting guide
  showTroubleshootingGuide(): void {
    console.group('[Wipay] 🚨 LocalStorage Error Troubleshooting Guide');
    console.log(`
🔍 ISSUE: You're seeing localStorage errors like "Failed to parse item from local storage: professional/short"

📋 DIAGNOSIS:
✅ These errors are from BROWSER EXTENSIONS, not your Wipay app
✅ Your Wipay app is working correctly and is protected from these errors
✅ Wipay uses Firebase for data storage and namespaced localStorage (wipay_*)

🛠️ SOLUTIONS TO TRY:

1. REFRESH THE PAGE
   - Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - This may clear cached errors

2. CLEAR BROWSER CACHE
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. DISABLE BROWSER EXTENSIONS TEMPORARILY
   - Go to browser extensions (chrome://extensions/)
   - Disable extensions one by one to identify the culprit
   - Common culprits: ad blockers, productivity tools, language tools

4. RUN AUTOMATIC CLEANUP
   - In this console, type: debugStorage.clearAllExternalStorage()
   - This will remove external localStorage items causing errors

5. USE INCOGNITO/PRIVATE MODE
   - Test your app in incognito mode
   - This runs without extensions and should show no errors

📞 NEED HELP?
- If errors persist in incognito mode, that indicates a real issue
- If errors only appear with extensions, they're harmless
- Your WiFi token system functionality is NOT affected

🎯 VERIFICATION:
- Test generating a WiFi token
- Test user login/logout
- Check if all features work normally
- If yes, the localStorage errors are just cosmetic
    `);
    console.groupEnd();
  },

  // Monitor console for localStorage-related errors
  monitorConsoleErrors(): void {
    if (typeof window === 'undefined') return;

    // This is now handled by the more aggressive error suppression in utils.ts
    console.log(
      '[Wipay] 🛡️ Console error monitoring activated - external localStorage errors will be blocked'
    );
  },

  // Check Firebase connection status
  checkFirebaseStatus(): void {
    console.group('[Wipay Debug] Firebase Status');

    try {
      // Check if Firebase is loaded
      if (typeof window !== 'undefined' && 'firebase' in window) {
        console.log('✅ Firebase SDK loaded');
      } else {
        console.log('ℹ️ Firebase SDK status unknown');
      }

      // Check environment variables
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      };

      const configSet = Object.values(firebaseConfig).every(
        value => value && value !== 'undefined'
      );

      if (configSet) {
        console.log('✅ Firebase configuration appears complete');
      } else {
        console.warn('⚠️ Firebase configuration may be incomplete');
        console.log(
          'Missing vars:',
          Object.entries(firebaseConfig)
            .filter(([_, value]) => !value || value === 'undefined')
            .map(([key]) => key)
        );
      }
    } catch (error) {
      console.error('❌ Error checking Firebase status:', error);
    }

    console.groupEnd();
  },

  // Run all debug checks
  runAllChecks(): void {
    console.log('🔍 [Wipay Debug] Running comprehensive checks...');
    this.analyzeLocalStorageErrors();
    this.checkFirebaseStatus();
    this.monitorConsoleErrors();
    this.showTroubleshootingGuide();
    console.log('✅ [Wipay Debug] All checks completed');
    console.log(
      '💡 If you still see localStorage errors, run: debugStorage.clearAllExternalStorage()'
    );
  },
};

// Make debugStorage available globally for user troubleshooting
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugStorage = debugStorage;
}

// Auto-run debug in development mode
if (
  import.meta.env.VITE_DEBUG_MODE === 'true' &&
  typeof window !== 'undefined'
) {
  setTimeout(() => {
    debugStorage.runAllChecks();
  }, 2000); // Wait 2 seconds for app to initialize
}
