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
  build: {
    chunkSizeWarningLimit: 1000, // Increase the warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          'vendor-charts': ['recharts', 'd3'],
          'vendor-utils': ['date-fns', 'firebase', '@tanstack/react-query'],
          // Split feature chunks
          'feature-dashboard': [
            './src/pages/DashboardPage.tsx',
            './src/components/dashboard/*',
          ],
          'feature-animals': [
            './src/pages/AnimalsPage.tsx',
            './src/components/animals/*',
          ],
          'feature-expenses': [
            './src/pages/ExpensesPage.tsx',
            './src/components/expenses/*',
          ],
        },
      },
    },
  },
}));
