import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    environment: 'node',
    globals: true,
    setupFiles: ['tests/setup/setup.ts'],
    env: {
      JWT_SECRET: 'a-dummy-secret-for-testing',
    },
  },
});
