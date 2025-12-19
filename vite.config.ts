import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src-new/domain'),
      '@application': path.resolve(__dirname, 'src-new/application'),
      '@infrastructure': path.resolve(__dirname, 'src-new/infrastructure'),
      '@presentation': path.resolve(__dirname, 'src-new/presentation'),
    },
  },
  server: {
    port: 5173,
    open: true
  }
});
