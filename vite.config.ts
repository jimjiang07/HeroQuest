import {defineConfig} from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath,URL} from 'node:url';

// relative base: the same build works at the GitHub Pages project URL and on localhost
export default defineConfig({
  base:'./',
  plugins:[vue()],
  resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
  build:{rollupOptions:{input:{app:'index.html',print:'print/index.html'}}},
  test:{include:['tests/unit/**/*.test.ts']}
});
