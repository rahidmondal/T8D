import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@src': resolve(__dirname, 'src'),
    },
  },
});
