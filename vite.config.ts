import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const dsSrc = fileURLToPath(new URL('./ai-design-system-main/src', import.meta.url));

// t-ds подключается из исходников: '@pluginwoman/t-ds' → src/index.ts, '/icons/…' → src/assets/Icon/…
export default defineConfig({
  // GitHub Pages отдаёт сайт по адресу https://drivetothegrave.github.io/figmatestpropotype/
  base: '/figmatestpropotype/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@pluginwoman\/t-ds\/icons\/(\d+)\/(\w+)$/, replacement: `${dsSrc}/assets/Icon/$1/$2.tsx` },
      { find: /^@pluginwoman\/t-ds\/icons$/, replacement: `${dsSrc}/icons.ts` },
      { find: /^@pluginwoman\/t-ds$/, replacement: `${dsSrc}/index.ts` },
    ],
  },
});
