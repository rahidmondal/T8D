import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['frontend/tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'backend/tests/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
