import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
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
        start_url: '/',
        icons: [
          {
            src: '/t8d192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/t8d512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
    }),
  ],
});
