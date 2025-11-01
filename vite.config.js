import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/',
  resolve: {
    // Ensure only one instance of React is used
    dedupe: ['react', 'react-dom']
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'מערכת ניתוח תלמידים - AI Student Dashboard',
        short_name: 'Student Dashboard',
        description: 'AI-powered student analysis dashboard with Claude AI integration',
        theme_color: '#4285f4',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'he',
        dir: 'rtl',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false,
    allowedHosts: ['.replit.dev', '.pike.replit.dev']
  },
  build: {
    // Target modern browsers for smaller bundle
    target: 'es2015',
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        // Advanced chunking strategy
        manualChunks: (id) => {
          // React core - MUST be together
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // Animations
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Icons (split separately - large library)
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
          // Charts (split separately - large library)
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // Export libraries (lazy load these)
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/xlsx')) {
            return 'export-libs';
          }
          // Other vendors
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps for debugging (disable in production for smaller size)
    sourcemap: false,
  }
});
