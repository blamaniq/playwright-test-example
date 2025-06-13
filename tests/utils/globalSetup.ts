import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Ensure output directories exist
  const outputDirs = ['screenshots', 'test-results', 'test-results/videos', 'test-results/traces'];

  for (const dir of outputDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  // Validate test environment
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔍 Validating test environment...');

    // Check if finn.no is accessible
    const response = await page.goto('https://www.finn.no', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (!response || !response.ok()) {
      console.warn('⚠️ Warning: finn.no might not be accessible');
    } else {
      console.log('✅ finn.no is accessible');
    }

    // Check for basic page structure
    const title = await page.title();
    if (!title.toLowerCase().includes('finn')) {
      console.warn('⚠️ Warning: Unexpected page title:', title);
    }
  } catch (error) {
    console.warn('⚠️ Warning: Environment validation failed:', error);
    // Don't fail setup - tests should handle network issues gracefully
  } finally {
    await browser.close();
  }

  // Create test report metadata
  const testMetadata = {
    startTime: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      ci: !!process.env.CI,
    },
    configuration: {
      baseURL: config.projects[0]?.use?.baseURL,
      browsers: config.projects.map(p => p.name),
      workers: config.workers,
      retries: config.projects[0]?.retries || 0,
    },
  };

  fs.writeFileSync('test-results/metadata.json', JSON.stringify(testMetadata, null, 2));

  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
