import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),

    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/script\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'ISHEBOT Student Dashboard',
        short_name: 'ISHEBOT',
        description: 'AI-Powered Student Analysis Dashboard',
        theme_color: '#3B82F6',
        background_color: '#F3F4F6',
        display: 'standalone',
        orientation: 'any',
        dir: 'rtl',
        lang: 'he',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    // Bundle Analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network'
    }),

    // Gzip Compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10kb
      deleteOriginFile: false,
    }),

    // Brotli Compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10kb
      deleteOriginFile: false,
    }),
  ],

  build: {
    // Optimize build
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 300, // 300kb warning threshold

    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Data visualization
          'charts': ['recharts', 'chart.js', 'react-chartjs-2'],

          // UI libraries
          'ui-vendor': ['framer-motion', 'react-hot-toast'],

          // State management and data fetching
          'data-vendor': ['@tanstack/react-query', 'axios'],

          // Icons
          'icons': ['lucide-react'],

          // Export libraries (heavy) - NOW WITH DYNAMIC IMPORTS!
          'export-xlsx': ['exceljs'],
          'export-pdf': ['jspdf', 'html2canvas'],

          // Localization
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],

          // Form handling
          'forms': ['@hookform/resolvers'],

          // Date utilities
          'date-utils': ['date-fns'],

          // DnD Kit
          'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },

        // Asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          } else if (/\.css$/i.test(assetInfo.name)) {
            extType = 'css';
          }

          return `assets/${extType}/[name]-[hash][extname]`;
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },

      // External dependencies (if using CDN)
      // external: ['react', 'react-dom'],
    },

    // Source maps for production debugging
    sourcemap: true,

    // Assets inlining threshold
    assetsInlineLimit: 4096, // 4kb

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: true,
  },

  // Optimization for development
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'recharts',
      'i18next',
      'react-i18next',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
    cors: true,

    // Warm up frequently used modules
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/components/dashboard/FuturisticDashboard.jsx',
        './src/components/dashboard/Dashboard.jsx',
      ],
    },
  },

  // Preview server
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: true,
  },

  // Performance optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
});