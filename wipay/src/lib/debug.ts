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
      console.log('🔧 External keys (extensions/other):', externalKeys.length, externalKeys.slice(0, 10)); // Show first 10
      
      // Check for problematic keys
      const problematicKeys = ['professional', 'short'];
      const foundProblematic = externalKeys.filter(key => 
        problematicKeys.some(prob => key.includes(prob))
      );
      
      if (foundProblematic.length > 0) {
        console.warn('⚠️ Found problematic keys (likely from extensions):', foundProblematic);
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

  // Monitor console for localStorage-related errors
  monitorConsoleErrors(): void {
    if (typeof window === 'undefined') return;

    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('localStorage') || message.includes('Failed to parse')) {
        console.group('[Wipay Debug] Caught localStorage Error');
        console.log('📍 Source: Console Error');
        console.log('📝 Message:', message);
        console.log('🔍 Likely from:', message.includes('content.js') ? 'Browser Extension' : 'Application');
        console.groupEnd();
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('localStorage') || message.includes('Failed to parse')) {
        console.group('[Wipay Debug] Caught localStorage Warning');
        console.log('📍 Source: Console Warning');
        console.log('📝 Message:', message);
        console.log('🔍 Likely from:', message.includes('content.js') ? 'Browser Extension' : 'Application');
        console.groupEnd();
      }
      originalWarn.apply(console, args);
    };
  },

  // Check Firebase connection status
  checkFirebaseStatus(): void {
    console.group('[Wipay Debug] Firebase Status');
    
    try {
      // Check if Firebase is loaded
      if (typeof window !== 'undefined' && (window as any).firebase) {
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
      
      const configSet = Object.values(firebaseConfig).every(value => value && value !== 'undefined');
      
      if (configSet) {
        console.log('✅ Firebase configuration appears complete');
      } else {
        console.warn('⚠️ Firebase configuration may be incomplete');
        console.log('Missing vars:', Object.entries(firebaseConfig)
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
    console.log('✅ [Wipay Debug] All checks completed');
  }
};

// Auto-run debug in development mode
if (import.meta.env.VITE_DEBUG_MODE === 'true' && typeof window !== 'undefined') {
  setTimeout(() => {
    debugStorage.runAllChecks();
  }, 2000); // Wait 2 seconds for app to initialize
} 