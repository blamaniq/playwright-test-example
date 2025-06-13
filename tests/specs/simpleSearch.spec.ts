import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

test.describe('Basic Search Tests', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigate('/realestate/homes/search.html?filters=');
    await searchPage.acceptCookies();
  });

  test('User can perform basic search for Oslo properties', async () => {
    // Simple location search
    await searchPage.searchByLocation('Oslo');
    
    // Verify we have some results (either cards or a results count)
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount, 'Should have search results for Oslo').toBeGreaterThan(0);
    
    console.log(`Found ${resultsCount} results for Oslo`);
  });

  test('Search page loads properly and has basic elements', async ({ page }) => {
    // Check that basic search elements are present
    const searchInput = page.locator('input[type="search"], input[aria-label*="Søk"]').first();
    await expect(searchInput).toBeVisible();
    
    const title = await page.title();
    expect(title).toContain('FINN');
  });
});