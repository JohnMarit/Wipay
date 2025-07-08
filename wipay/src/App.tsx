import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WiFiTokenSystem from "./components/WiFiTokenSystem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// User authentication for WiFi token system
interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Check for existing authentication
    const storedUser = localStorage.getItem('wifiTokenUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('wifiTokenUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('wifiTokenUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wifiTokenUser');
    localStorage.removeItem('wifiConfig');
  };

  const handleSignUp = (name: string, phone: string, email: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      phone,
      email
    };
    handleLogin(newUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WiFi Token System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="p-3 bg-blue-600 rounded-full inline-block mb-4">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800">WiFi Token System</h1>
                  <p className="text-gray-600">Generate and distribute WiFi access tokens</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="col-span-2 p-2 border rounded"
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => handleLogin({
                      id: '1',
                      name: 'WiFi Admin',
                      phone: '+211912345678',
                      email: 'admin@wifi.ss'
                    })}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    Login as Admin
                  </button>
                  
                  <button
                    onClick={() => handleSignUp('Demo User', '+211923456789', 'user@wifi.ss')}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 transition-colors"
                  >
                    Sign Up New Account
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Demo login - Start generating WiFi tokens immediately
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <WiFiTokenSystem 
                  language={language}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
