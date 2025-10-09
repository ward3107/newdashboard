import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
    allowedHosts: ['.replit.dev', '.pike.replit.dev']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks to reduce bundle size
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'react-hot-toast', 'lucide-react'],
          'chart-vendor': ['recharts'],
          'export-vendor': ['jspdf', 'xlsx'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
});
