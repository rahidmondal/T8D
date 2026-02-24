import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OfficialSync',
      fileName: () => 'index.js',
      formats: ['es'],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
