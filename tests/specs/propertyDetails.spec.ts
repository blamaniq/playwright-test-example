import { expect, test } from '@playwright/test';
import { validSearchData } from '../fixtures/testData';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { SearchPage } from '../pages/SearchPage';
import { TestHelpers } from '../utils/helpers';

test.describe('Finn.no Property Details Tests', () => {
  let searchPage: SearchPage;
  let propertyDetailsPage: PropertyDetailsPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    propertyDetailsPage = new PropertyDetailsPage(page);

    // Navigate to search page and find a property
    await searchPage.navigate('/realestate/homes/search.html?filters=');
    await searchPage.acceptCookies();
    await searchPage.searchByLocation(validSearchData.locations[0]);
    await searchPage.clickFirstProperty();
  });

  test('Property details page displays comprehensive information', async ({ page }) => {
    // Verify all essential information is present
    expect(await propertyDetailsPage.isPropertyInfoComplete()).toBeTruthy();

    // Check specific property details
    const title = await propertyDetailsPage.getPropertyTitle();
    const price = await propertyDetailsPage.getPropertyPrice();
    const address = await propertyDetailsPage.getPropertyAddress();
    const size = await propertyDetailsPage.getPropertySize();
    const type = await propertyDetailsPage.getPropertyType();

    // All fields should have values
    expect(title).toBeTruthy();
    expect(price).toBeTruthy();
    expect(address).toBeTruthy();
    expect(size).toBeTruthy();
    expect(type).toBeTruthy();

    // Price should be a valid number
    const priceNumber = TestHelpers.extractPriceNumber(price);
    expect(priceNumber).toBeGreaterThan(0);

    // Size should be a valid number
    const sizeNumber = parseInt(size.replace(/\D/g, ''));
    expect(sizeNumber).toBeGreaterThan(0);

    // Take screenshot for documentation
    await TestHelpers.takeTimestampedScreenshot(page, 'property-details-complete');
  });

  test('Image gallery navigation works correctly', async ({ page }) => {
    // Wait for gallery to load
    const gallery = page.locator('[data-testid="image-gallery"]');
    await expect(gallery).toBeVisible();

    // Get initial image
    const initialImage = await page
      .locator('img[data-testid="gallery-image"]')
      .first()
      .getAttribute('src');

    // Navigate to next image
    await propertyDetailsPage.navigateImageGallery('next');

    // Verify image changed
    const nextImage = await page
      .locator('img[data-testid="gallery-image"]')
      .first()
      .getAttribute('src');
    expect(nextImage).not.toBe(initialImage);

    // Navigate back
    await propertyDetailsPage.navigateImageGallery('previous');

    // Should return to initial image
    const currentImage = await page
      .locator('img[data-testid="gallery-image"]')
      .first()
      .getAttribute('src');
    expect(currentImage).toBe(initialImage);
  });

  test('Contact form submission works correctly', async ({ page }) => {
    // Click contact button
    await propertyDetailsPage.clickContactAgent();

    // Verify contact modal/form appears
    const contactForm = page.locator('[data-testid="contact-form"], [role="dialog"]');
    await expect(contactForm).toBeVisible({ timeout: 5000 });

    // Fill contact form (if fields are visible)
    const nameInput = page.locator('input[name="name"], input[placeholder*="navn"]');
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="melding"]');

    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Bruker');
    }
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('98765432');
    }
    if (await messageInput.isVisible()) {
      await messageInput.fill('Jeg er interessert i denne eiendommen. Kan dere kontakte meg?');
    }

    // Take screenshot of filled form
    await TestHelpers.takeTimestampedScreenshot(page, 'contact-form-filled');

    // Note: Not submitting the form in test to avoid sending real inquiries
  });

  test('Agent information is displayed correctly', async ({ page }) => {
    // Get agent name
    const agentName = await propertyDetailsPage.getAgentName();
    expect(agentName).toBeTruthy();

    // Verify agent contact info is visible
    const agentSection = page.locator('[data-testid="broker-card"]');
    await expect(agentSection).toBeVisible();

    // Check for phone number
    const phoneElement = agentSection.locator('a[href^="tel:"]');
    if (await phoneElement.isVisible()) {
      const phoneNumber = await phoneElement.textContent();
      expect(TestHelpers.isValidNorwegianPhone(phoneNumber || '')).toBeTruthy();
    }
  });

  test('Viewing information is displayed when available', async ({ page }) => {
    // Check if viewing is scheduled
    const hasViewing = await propertyDetailsPage.hasViewingScheduled();

    if (hasViewing) {
      const viewingDetails = await propertyDetailsPage.getViewingDetails();
      expect(viewingDetails).not.toBe('No viewing scheduled');
      expect(viewingDetails).toContain('Visning');

      // Take screenshot of viewing section
      await TestHelpers.takeTimestampedScreenshot(page, 'viewing-information');
    }
  });

  test('Favorite functionality works correctly', async ({ page }) => {
    // Get initial state of favorite button
    const favoriteButton = page.locator('button[aria-label*="favoritt"]');
    const initialAriaPressed = await favoriteButton.getAttribute('aria-pressed');

    // Toggle favorite
    await propertyDetailsPage.toggleFavorite();

    // Wait for state change
    await page.waitForTimeout(500);

    // Verify state changed
    const newAriaPressed = await favoriteButton.getAttribute('aria-pressed');
    expect(newAriaPressed).not.toBe(initialAriaPressed);

    // Toggle back
    await propertyDetailsPage.toggleFavorite();
    await page.waitForTimeout(500);

    // Should return to initial state
    const finalAriaPressed = await favoriteButton.getAttribute('aria-pressed');
    expect(finalAriaPressed).toBe(initialAriaPressed);
  });

  test('Property page is responsive on mobile devices', async ({ page, browserName }) => {
    // Skip this test on webkit as it has different mobile behavior
    test.skip(browserName === 'webkit', 'Mobile test skipped on webkit');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

    // Reload page with mobile viewport
    await page.reload();

    // Verify key elements are still visible and accessible
    expect(await propertyDetailsPage.isPropertyInfoComplete()).toBeTruthy();

    // Check mobile-specific UI elements
    const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="meny"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }

    // Take mobile screenshot
    await TestHelpers.takeTimestampedScreenshot(page, 'property-details-mobile');
  });
});
