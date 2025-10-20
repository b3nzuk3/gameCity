import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs:
          mode === 'production' ? ['console.log', 'console.info'] : [],
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
    },

    // Enable source maps for debugging
    sourcemap: mode === 'development',

    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          utils: ['axios', 'clsx', 'tailwind-merge'],
          query: ['@tanstack/react-query'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Target modern browsers for better optimization
    target: 'es2020',

    // Enable CSS code splitting
    cssCodeSplit: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      '@tanstack/react-query',
    ],
  },
}))
