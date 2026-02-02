import { reactRouter } from '@react-router/dev/vite';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
  plugins: [reactRouter(), tsconfigPaths(), UnoCSS()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('lodash-es') || id.includes('dayjs')) {
            return 'vendor-utils';
          }
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-3d';
          }
          if (id.includes('@mlc-ai/web-llm')) {
            return 'vendor-ai';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
}));
