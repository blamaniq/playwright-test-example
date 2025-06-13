/**
 * Playwright Test Configuration
 * 
 * This configuration provides:
 * - Multi-browser testing (Chrome, Firefox, Safari, Mobile)
 * - Comprehensive reporting (HTML, JUnit, JSON)
 * - Optimized timeouts and retry logic
 * - Norwegian locale support
 * - Enhanced debugging capabilities
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/specs",
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  
  // Reporting
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : [])
  ],
  
  // Global test settings
  use: {
    baseURL: "https://www.finn.no",
    
    // Tracing and debugging
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    
    // Timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Locale and viewport
    locale: 'nb-NO',
    timezoneId: 'Europe/Oslo',
    
    // Additional settings
    ignoreHTTPSErrors: true,
    bypassCSP: false,
  },

  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
    },
    {
      name: "firefox",
      use: { 
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
    },
    {
      name: "webkit",
      use: { 
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
    },
    {
      name: "Mobile Chrome",
      use: { 
        ...devices["Pixel 5"],
        isMobile: true,
        hasTouch: true
      },
      testIgnore: ['**/crossBrowserResponsive.spec.ts'] // Skip responsive tests on mobile project
    },
    {
      name: "Mobile Safari",
      use: { 
        ...devices["iPhone 12"],
        isMobile: true,
        hasTouch: true
      },
      testIgnore: ['**/crossBrowserResponsive.spec.ts']
    },
    {
      name: "Tablet",
      use: { 
        ...devices["iPad Pro"],
        viewport: { width: 1024, height: 768 }
      },
      testIgnore: ['**/crossBrowserResponsive.spec.ts']
    }
  ],
  
  // Output directories
  outputDir: 'test-results/',
  
  // Web server configuration (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});