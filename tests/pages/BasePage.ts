import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async acceptCookies() {
    try {
      // Wait longer for cookie banner and try multiple selectors
      const selectors = [
        'button:has-text("Godta alle")',
        'button:has-text("Accept all")',
        '[data-testid="accept-all-cookies"]',
        'button[class*="accept"]',
        'button[aria-label*="accept"]'
      ];

      for (const selector of selectors) {
        const cookieButton = this.page.locator(selector).first();
        if (await cookieButton.isVisible({ timeout: 3000 })) {
          await cookieButton.click();
          // Wait for the modal to disappear
          await this.page.waitForTimeout(2000);
          return;
        }
      }
    } catch (e) {
      console.warn('Cookie banner handling failed:', e);
    }
  }
}
