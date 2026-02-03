import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for B2C Autowartungs-App E2E Testing
 *
 * This configuration is optimized for:
 * - Multi-language testing (DE/EN)
 * - Mobile and desktop responsive testing
 * - CI/CD integration with comprehensive reporting
 * - Visual regression testing
 * - Production-ready test reliability
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Global setup - creates authenticated sessions before tests */
  globalSetup: require.resolve('./e2e/global-setup'),

  /* Maximum time one test can run */
  timeout: 60 * 1000, // 60 seconds per test

  /* Test timeout for expect() assertions */
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential to avoid database conflicts

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only - helps with flaky tests */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI to ensure database consistency */
  workers: process.env.CI ? 1 : undefined,

  /* Multiple reporters for different purposes */
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'], // Console output for CI logs
        ['junit', { outputFile: 'test-results/junit.xml' }], // For CI integration
        ['json', { outputFile: 'test-results/results.json' }], // For programmatic analysis
      ]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }],
        ['list'],
      ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL - environment aware */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure - helps debug issues */
    video: 'retain-on-failure',

    /* Maximum time for navigation and action */
    navigationTimeout: 30 * 1000,
    actionTimeout: 15 * 1000,

    /* Emulate user locale and timezone */
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',

    /* Viewport size for consistent screenshots */
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for major browsers and device types */
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox-desktop',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1280, height: 720 },
    //   },
    // },

    // {
    //   name: 'webkit-desktop',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1280, height: 720 },
    //   },
    // },
  ],

  /* Output folder for test artifacts */
  outputDir: 'test-results/',

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  snapshotDir: 'e2e/__snapshots__',

  /* Visual regression testing settings */
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
    toHaveScreenshot: {
      maxDiffPixels: 100, // Allow small differences
      threshold: 0.2, // 20% threshold for pixel differences
    },
  },

  /* Assume dev server is already running */
  // We expect the dev server to be running on port 3000
  // Start it manually with: npm run dev
  // Or use webServer config below to start automatically:

  /*
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  */
});
