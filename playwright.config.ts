import {defineConfig,devices} from '@playwright/test';

// runs against the production build; phone and tablet both, because every screen must fit without scrolling.
// HQ_PORT runs a separate build (no type check) on its own port, so two test runs can go side by side
const port=Number(process.env.HQ_PORT??4173),out=port===4173?'dist':`dist-${port}`;
export default defineConfig({
  testDir:'tests/e2e',
  timeout:120000,
  use:{baseURL:`http://localhost:${port}`,launchOptions:{args:['--mute-audio']}},
  projects:[
    {name:'tablet',use:{viewport:{width:820,height:1180},hasTouch:true}},
    {name:'phone',use:{...devices['iPhone 13'],browserName:'chromium',defaultBrowserType:'chromium'}}
  ],
  // on CI the workflow builds once before testing; locally the tests build first
  webServer:{command:process.env.CI?'npm run preview':port===4173?'npm run build && npm run preview':`npx vite build --outDir ${out} && npx vite preview --outDir ${out} --port ${port} --strictPort`,
    url:`http://localhost:${port}`,reuseExistingServer:!process.env.CI&&port===4173,timeout:180000}
});
