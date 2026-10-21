import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'tests',
  timeout:120000,
  use:{baseURL:'http://localhost:4173',viewport:{width:820,height:1180}},
  webServer:{command:'npx http-server -p 4173 -c-1 -s',url:'http://localhost:4173',reuseExistingServer:true}
});
