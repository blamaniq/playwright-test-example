import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface SearchFilters {
  location?: string;
  priceFrom?: string;
  priceTo?: string;
  sizeFrom?: string;
  sizeTo?: string;
  propertyType?: string;
}

export class SearchPage extends BasePage {
  // Main search elements
  private readonly searchInput: Locator;

  // Filter elements
  private readonly priceFromInput: Locator;
  private readonly priceToInput: Locator;
  private readonly propertySizeFromInput: Locator;
  private readonly propertySizeToInput: Locator;
  private readonly propertyTypeDropdown: Locator;

  // Results elements (keeping for future use)
  private readonly propertyCards: Locator;
  private readonly noResultsMessage: Locator;

  // View controls
  private readonly mapToggle: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators with improved selectors - using more specific selectors
    this.searchInput = page.locator(
      '[data-testid="search-input"], input[aria-label*="Søk i Eiendom"], input[placeholder*="by eller adresse"]'
    ).first();

    // Filter inputs with more specific selectors
    this.priceFromInput = page.locator(
      '[data-testid="price-from"], input[name="price_from"], input[aria-label*="Prisantydning, minimum"]'
    ).first();
    this.priceToInput = page.locator(
      '[data-testid="price-to"], input[name="price_to"], input[aria-label*="Prisantydning, maksimum"]'
    ).first();
    this.propertySizeFromInput = page.locator(
      '[data-testid="size-from"], input[name*="area"][name*="from"], input[aria-label*="minimum"]'
    ).first();
    this.propertySizeToInput = page.locator(
      '[data-testid="size-to"], input[name*="area"][name*="to"], input[aria-label*="maksimum"]'
    ).first();
    this.propertyTypeDropdown = page.locator(
      '[data-testid="property-type"], select[name*="type"], [aria-label*="boligtype"]'
    );

    // Results elements
    this.propertyCards = page.locator(
      '[data-testid="property-card"], [data-testid="search-result-ad"], article, [class*="result"], [class*="listing"], a[href*="/realestate/"]'
    );
    this.noResultsMessage = page.locator(
      '[data-testid="no-results"]'
    ).or(page.getByText(/ingen.*?treff/i)).or(page.getByText(/no.*?results/i));

    // View controls
    this.mapToggle = page.locator(
      '[data-testid="map-toggle"], button:has-text("kart"), button[aria-label*="kart"]'
    );
    this.sortDropdown = page.locator(
      '[data-testid="sort-dropdown"], select[aria-label*="sort"], select[class*="sort"]'
    );
  }

  async searchByLocation(location: string): Promise<void> {
    await this.searchInput.fill(location);

    // Wait for autocomplete suggestions if they appear
    await this.page.waitForTimeout(500);

    // Try to select from autocomplete first, then fallback to Enter
    const autocompleteOption = this.page
      .locator(
        `[role="option"]:has-text("${location}"), [class*="autocomplete"] li:has-text("${location}")`
      )
      .first();

    if (await autocompleteOption.isVisible({ timeout: 2000 })) {
      await autocompleteOption.click();
    } else {
      await this.page.keyboard.press('Enter');
    }

    await this.waitForLoadingComplete();
  }

  async setPriceRange(from?: string, to?: string): Promise<void> {
    if (from) {
      await this.priceFromInput.clear();
      await this.priceFromInput.fill(from);
      await this.page.waitForTimeout(300); // Allow for field validation
    }
    if (to) {
      await this.priceToInput.clear();
      await this.priceToInput.fill(to);
      await this.page.waitForTimeout(300);
    }

    // Trigger search by pressing tab or clicking outside
    await this.page.keyboard.press('Tab');
  }

  async setPropertySize(from?: string, to?: string): Promise<void> {
    if (from) {
      await this.propertySizeFromInput.clear();
      await this.propertySizeFromInput.fill(from);
      await this.page.waitForTimeout(300);
    }
    if (to) {
      await this.propertySizeToInput.clear();
      await this.propertySizeToInput.fill(to);
      await this.page.waitForTimeout(300);
    }

    await this.page.keyboard.press('Tab');
  }

  async selectPropertyType(type: string): Promise<void> {
    await this.propertyTypeDropdown.selectOption(type);
    await this.waitForLoadingComplete();
  }

  async getResultsCount(): Promise<number> {
    try {
      // Simply count the visible property cards
      const cardCount = await this.propertyCards.count();
      if (cardCount > 0) {
        return cardCount;
      }

      // Try to find result count in text if no cards visible
      const resultaterElement = this.page.getByText(/\d+\s+resultater/i).first();
      if (await resultaterElement.isVisible({ timeout: 5000 })) {
        const text = await resultaterElement.textContent();
        const match = text?.match(/(\d+)\s+resultater/i);
        if (match) {
          return parseInt(match[1]);
        }
      }

      return 0;
    } catch (error) {
      console.warn('Could not get results count:', error);
      return 0;
    }
  }

  async getPropertyCards(): Promise<Locator[]> {
    const count = await this.propertyCards.count();
    const cards: Locator[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.propertyCards.nth(i));
    }
    return cards;
  }

  async clickFirstProperty(): Promise<void> {
    await this.propertyCards.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async sortBy(sortOption: string): Promise<void> {
    await this.sortDropdown.selectOption(sortOption);
    await this.waitForLoadingComplete();
  }

  async toggleMapView(): Promise<void> {
    await this.mapToggle.click();
    await this.page.waitForTimeout(2000); // Wait for map to load
  }

  private async waitForLoadingComplete(): Promise<void> {
    // Wait for network to be idle
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for any loading indicators to disappear
    const loadingIndicator = this.page.locator(
      '[data-testid="loading"], [class*="loading"], [class*="spinner"]'
    );

    if (await loadingIndicator.isVisible({ timeout: 1000 })) {
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 });
    }

    // Wait for page to be stable - just wait a bit
    await this.page.waitForTimeout(2000);
  }

  async applyFilters(filters: SearchFilters): Promise<void> {
    // Apply location filter first as it might reset other filters
    if (filters.location) {
      await this.searchByLocation(filters.location);
    }

    // Apply other filters in sequence
    if (filters.priceFrom || filters.priceTo) {
      await this.setPriceRange(filters.priceFrom, filters.priceTo);
    }

    if (filters.sizeFrom || filters.sizeTo) {
      await this.setPropertySize(filters.sizeFrom, filters.sizeTo);
    }

    if (filters.propertyType) {
      await this.selectPropertyType(filters.propertyType);
    }

    // Wait for all filters to be applied
    await this.waitForLoadingComplete();
  }

  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage.isVisible({ timeout: 5000 });
  }

  async getPropertyCardInfo(index: number = 0): Promise<{
    title: string;
    price: string;
    address: string;
    size: string;
  }> {
    const card = this.propertyCards.nth(index);
    await card.waitFor({ timeout: 10000 });

    const title = (await card.locator('[class*="title"], h2, h3').first().textContent()) || '';
    const price =
      (await card.locator('[class*="price"], [class*="cost"]').first().textContent()) || '';
    const address =
      (await card.locator('[class*="address"], [class*="location"]').first().textContent()) || '';
    const size = (await card.getByText(/\d+\s*m²/).first().textContent()) || '';

    return { title, price, address, size };
  }
}
