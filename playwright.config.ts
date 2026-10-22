import {defineConfig,devices} from '@playwright/test';

// runs against the production build; phone and tablet both, because every screen must fit without scrolling
export default defineConfig({
  testDir:'tests/e2e',
  timeout:120000,
  use:{baseURL:'http://localhost:4173',launchOptions:{args:['--mute-audio']}},
  projects:[
    {name:'tablet',use:{viewport:{width:820,height:1180},hasTouch:true}},
    {name:'phone',use:{...devices['iPhone 13'],browserName:'chromium',defaultBrowserType:'chromium'}}
  ],
  // on CI the workflow builds once before testing; locally the tests build first
  webServer:{command:process.env.CI?'npm run preview':'npm run build && npm run preview',url:'http://localhost:4173',reuseExistingServer:!process.env.CI,timeout:180000}
});
