import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

import dotenv from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

//const storageStatePath = path.resolve(__dirname, 'playwright/.auth/loginStateCommon.json');
//const storageStatePath = path.resolve(__dirname, 'storage/user.json');
// if (!existsSync(storageStatePath)) {
//   mkdirSync(path.dirname(storageStatePath), { recursive: true });
//   writeFileSync(storageStatePath, JSON.stringify({ cookies: [], origins: [] }, null, 2));
// }

export const AUTH_STATE_PATH = 'playwright/.auth/github_user.json';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  testMatch: [
    'tests/**/*.spec.ts',
    'Git-Hub-Automation/tests/**/*.spec.ts',
    'OrangeHRM_POM/tests/**/*.spec.ts'
  ],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //reporter: 'html',
 

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    viewport:null, 
    screenshot: 'only-on-failure',  
    video: 'retain-on-failure',
    baseURL: 'https://github.com',
    //storageState: 'playwright/.auth/user.json'
    storageState: AUTH_STATE_PATH,
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],
 
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
