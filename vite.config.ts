import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-slot']
        }
      }
    },
    // Ensure proper handling of dynamic imports
    target: 'es2015',
    chunkSizeWarningLimit: 1000,
  },
  // Add preview configuration for testing
  preview: {
    port: 4173,
    host: true,
  },
  // Define for production builds
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
