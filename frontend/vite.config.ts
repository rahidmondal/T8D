import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/T8D/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['t8d192.png', 't8d512.png'],
      manifest: {
        name: 'T8D : A To-Do List Application',
        short_name: 'T8D',
        description: 'A To-Do List Application',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        start_url: '/T8D/',
        icons: [
          {
            src: '/T8D/t8d192.png',
            sizes: '192x192',
            type: 'image/png',
              },
          {
            src: '/T8D/t8d512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        navigateFallback: '/T8D/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@src': resolve(__dirname, 'src'),
    },
  },
});
