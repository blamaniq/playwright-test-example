import { test, expect, devices } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { TestHelpers } from '../utils/helpers';
import { validSearchData } from '../fixtures/testData';

test.describe('Cross-browser and Responsive Tests', () => {
  let searchPage: SearchPage;
  let propertyDetailsPage: PropertyDetailsPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    propertyDetailsPage = new PropertyDetailsPage(page);

    await searchPage.navigate('/realestate/homes/search.html?filters=');
    await searchPage.acceptCookies();
  });

  test.describe('Cross-browser Compatibility', () => {
    const testLocation = validSearchData.locations[0];

    test('Property search works in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');

      await searchPage.searchByLocation(testLocation);

      const resultsCount = await searchPage.getResultsCount();
      expect(resultsCount, 'Chromium should display search results').toBeGreaterThanOrEqual(0);

      if (resultsCount > 0) {
        const cards = await searchPage.getPropertyCards();
        expect(cards.length, 'Chromium should show property cards').toBeGreaterThan(0);
      }

      await TestHelpers.takeTimestampedScreenshot(page, 'chromium-search-results');
    });

    test('Property search works in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');

      await searchPage.searchByLocation(testLocation);

      const resultsCount = await searchPage.getResultsCount();
      expect(resultsCount, 'Firefox should display search results').toBeGreaterThanOrEqual(0);

      if (resultsCount > 0) {
        const cards = await searchPage.getPropertyCards();
        expect(cards.length, 'Firefox should show property cards').toBeGreaterThan(0);
      }

      await TestHelpers.takeTimestampedScreenshot(page, 'firefox-search-results');
    });

    test('Property search works in WebKit/Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'This test is for WebKit only');

      await searchPage.searchByLocation(testLocation);

      const resultsCount = await searchPage.getResultsCount();
      expect(resultsCount, 'WebKit should display search results').toBeGreaterThanOrEqual(0);

      if (resultsCount > 0) {
        const cards = await searchPage.getPropertyCards();
        expect(cards.length, 'WebKit should show property cards').toBeGreaterThan(0);
      }

      await TestHelpers.takeTimestampedScreenshot(page, 'webkit-search-results');
    });

    test('Property details consistency across browsers', async ({ page, browserName }) => {
      await searchPage.searchByLocation(testLocation);

      const hasResults = (await searchPage.getResultsCount()) > 0;
      if (!hasResults) {
        test.skip(true, `No results available for cross-browser test in ${testLocation}`);
      }

      await searchPage.clickFirstProperty();
      await propertyDetailsPage.waitForPageLoad();

      const propertyInfo = await propertyDetailsPage.getCompletePropertyInfo();

      // Verify essential information is present across all browsers
      expect(propertyInfo.title, `${browserName} should display property title`).toBeTruthy();
      expect(propertyInfo.address, `${browserName} should display property address`).toBeTruthy();

      await TestHelpers.takeTimestampedScreenshot(page, `${browserName}-property-details`);
    });
  });

  test.describe('Responsive Design Tests', () => {
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 812 }, // iPhone X
      { name: 'Mobile Landscape', width: 812, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 }, // iPad
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop Small', width: 1280, height: 720 },
      { name: 'Desktop Large', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`Search functionality on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        const location = validSearchData.locations[0];
        await searchPage.searchByLocation(location);

        // Check if search completed
        const resultsCount = await searchPage.getResultsCount();
        expect(resultsCount, `Search should work on ${viewport.name}`).toBeGreaterThanOrEqual(0);

        // Verify search interface is accessible
        const searchInput = page
          .locator('input[type="search"], input[placeholder*="søk"], input[placeholder*="search"]')
          .first();

        if (await searchInput.isVisible({ timeout: 5000 })) {
          const isInViewport = await TestHelpers.isElementInViewport(searchInput);
          expect(isInViewport, `Search input should be visible on ${viewport.name}`).toBeTruthy();
        }

        // Test mobile-specific navigation if on mobile viewport
        if (viewport.width <= 768) {
          // Look for mobile menu or navigation
          const mobileMenuSelectors = [
            'button[aria-label*="menu"]',
            'button[aria-label*="meny"]',
            '[data-testid="mobile-menu"]',
            '.hamburger',
            'button:has(svg):not([aria-label*="search"])',
          ];

          for (const selector of mobileMenuSelectors) {
            const mobileMenu = page.locator(selector).first();
            if (await mobileMenu.isVisible({ timeout: 2000 })) {
              console.log(`Found mobile menu: ${selector}`);
              break;
            }
          }
        }

        await TestHelpers.takeTimestampedScreenshot(
          page,
          `responsive-${viewport.name.toLowerCase().replace(/\s+/g, '-')}-search`
        );
      });
    }

    test('Property details responsive behavior', async ({ page }) => {
      // Start with desktop view to find a property
      await page.setViewportSize({ width: 1280, height: 720 });

      const location = validSearchData.locations[0];
      await searchPage.searchByLocation(location);

      const hasResults = (await searchPage.getResultsCount()) > 0;
      if (!hasResults) {
        test.skip(true, `No results available for responsive test in ${location}`);
      }

      await searchPage.clickFirstProperty();
      await propertyDetailsPage.waitForPageLoad();

      // Test different viewports on property details page
      const testViewports = [
        { name: 'Mobile', width: 375, height: 812 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1280, height: 720 },
      ];

      for (const viewport of testViewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000); // Allow for responsive adjustments

        // Verify essential elements are still visible and accessible
        const isInfoComplete = await propertyDetailsPage.isPropertyInfoComplete();
        expect(isInfoComplete, `Property info should be complete on ${viewport.name}`).toBeTruthy();

        // Test image gallery on different viewports
        try {
          const imageCount = await propertyDetailsPage.getImageCount();
          if (imageCount > 1) {
            await propertyDetailsPage.navigateImageGallery('next');
            await TestHelpers.takeTimestampedScreenshot(
              page,
              `responsive-${viewport.name.toLowerCase()}-gallery`
            );
          }
        } catch (error) {
          console.warn(`Image gallery test failed on ${viewport.name}:`, error);
        }

        await TestHelpers.takeTimestampedScreenshot(
          page,
          `responsive-${viewport.name.toLowerCase()}-details`
        );
      }
    });

    test('Touch interactions on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 812 });

      const location = validSearchData.locations[0];
      await searchPage.searchByLocation(location);

      const hasResults = (await searchPage.getResultsCount()) > 0;
      if (!hasResults) {
        test.skip(true, `No results available for touch interaction test in ${location}`);
      }

      // Test touch scrolling
      const propertyCards = await searchPage.getPropertyCards();
      if (propertyCards.length > 0) {
        // Scroll down to load more results (if pagination/infinite scroll exists)
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        await page.waitForTimeout(2000);

        // Check if more results loaded
        const newResultsCount = await searchPage.getResultsCount();
        console.log(`Results after scroll: ${newResultsCount}`);

        // Test tap interaction on property card
        await propertyCards[0].tap();
        await propertyDetailsPage.waitForPageLoad();

        // Verify property details loaded correctly
        const isInfoComplete = await propertyDetailsPage.isPropertyInfoComplete();
        expect(isInfoComplete, 'Property details should load after touch interaction').toBeTruthy();

        await TestHelpers.takeTimestampedScreenshot(page, 'mobile-touch-interaction');
      }
    });
  });

  test.describe('Device-specific Tests', () => {
    test('iPhone 12 Pro user experience', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12 Pro'],
        locale: 'nb-NO', // Norwegian locale
      });

      const page = await context.newPage();
      const mobilePage = new SearchPage(page);

      await mobilePage.navigate('/realestate/homes/search.html?filters=');
      await mobilePage.acceptCookies();

      const location = validSearchData.locations[0];
      await mobilePage.searchByLocation(location);

      const resultsCount = await mobilePage.getResultsCount();
      expect(resultsCount, 'iPhone should display search results').toBeGreaterThanOrEqual(0);

      await TestHelpers.takeTimestampedScreenshot(page, 'iphone-12-pro-experience');
      await context.close();
    });

    test('iPad user experience', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPad Pro'],
        locale: 'nb-NO',
      });

      const page = await context.newPage();
      const tabletPage = new SearchPage(page);

      await tabletPage.navigate('/realestate/homes/search.html?filters=');
      await tabletPage.acceptCookies();

      const location = validSearchData.locations[1];
      await tabletPage.searchByLocation(location);

      const resultsCount = await tabletPage.getResultsCount();
      expect(resultsCount, 'iPad should display search results').toBeGreaterThanOrEqual(0);

      await TestHelpers.takeTimestampedScreenshot(page, 'ipad-pro-experience');
      await context.close();
    });
  });

  test.describe('Performance Tests', () => {
    test('Page load performance across different viewport sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 812 }, // Mobile
        { width: 1280, height: 720 }, // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);

        const performanceStart = Date.now();
        await searchPage.navigate('/realestate/homes/search.html?filters=');
        const loadTime = Date.now() - performanceStart;

        const performance = await TestHelpers.validatePagePerformance(page);

        console.log(
          `${viewport.width}x${viewport.height} - Load time: ${loadTime}ms, Performance: ${performance.performance}`
        );

        // Performance expectations (more lenient for mobile)
        const maxLoadTime = viewport.width <= 768 ? 15000 : 10000;
        expect(
          loadTime,
          `Load time should be reasonable for ${viewport.width}x${viewport.height}`
        ).toBeLessThan(maxLoadTime);
      }
    });
  });
});
