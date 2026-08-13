import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import path from 'path'
import { readFileSync } from 'node:fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      prerenderScript: path.resolve(__dirname, './src/prerender.tsx'),
      additionalPrerenderRoutes: [
        '/contact',
        '/privacy',
        '/terms',
        '/sitemap',
        ...readManifestRoutes(),
        ...readCategoryRoutes(),
      ],
    }),
  ],

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

function readManifestRoutes(): string[] {
  try {
    const manifest = JSON.parse(
      readFileSync(path.resolve(__dirname, './public/catalog-manifest.json'), 'utf8')
    )
    return Array.isArray(manifest.products)
      ? manifest.products
          .map((product: { path?: string }) => product.path)
          .filter((route: string | undefined): route is string => Boolean(route))
      : []
  } catch {
    return []
  }
}

function readCategoryRoutes(): string[] {
  try {
    const manifest = JSON.parse(
      readFileSync(path.resolve(__dirname, './public/catalog-manifest.json'), 'utf8')
    )
    const counts = new Map<string, number>([['all', manifest.products.length]])
    for (const product of manifest.products) {
      const category = String(product.category || '').trim().toLowerCase().replace(/\s+/g, '-')
      if (category) counts.set(category, (counts.get(category) || 0) + 1)
    }
    return [...counts.entries()].flatMap(([category, total]) => {
      const pages = Math.max(1, Math.ceil(total / 12))
      return Array.from({ length: pages }, (_, index) =>
        `/category/${category}/page/${index + 1}`
      )
    })
  } catch {
    return []
  }
}
