import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase the warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', '@tanstack/react-query'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage']
        },
      },
    },
    commonjsOptions: {
      include: [/firebase/, /node_modules/],
      transformMixedEsModules: true
    },
  },
}));
