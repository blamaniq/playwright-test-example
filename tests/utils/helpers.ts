import { Page, Locator } from '@playwright/test';

export interface ScreenshotOptions {
  fullPage?: boolean;
  timeout?: number;
  path?: string;
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
}

export interface WaitOptions {
  timeout?: number;
  interval?: number;
}

export class TestHelpers {
  /**
   * Generates a random number within a range
   */
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Formats price for display (adds thousand separators)
   */
  static formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /**
   * Extracts number from price string
   */
  static extractPriceNumber(priceString: string): number {
    const cleanedString = priceString.replace(/[^\d]/g, '');
    return parseInt(cleanedString) || 0;
  }

  /**
   * Waits for DOM content to be loaded with improved error handling
   */
  static async waitForDOMReady(page: Page, timeout: number = 30000): Promise<void> {
    try {
      await page.waitForLoadState('domcontentloaded', { timeout });
      // Additional wait for any dynamic content to load
      await page.waitForTimeout(1000);
    } catch (error) {
      console.warn(`DOM ready timeout after ${timeout}ms:`, error);
      // Continue execution - page might still be usable
    }
  }

  /**
   * Waits for element to be stable (not moving)
   */
  static async waitForElementStable(locator: Locator, options: WaitOptions = {}): Promise<void> {
    const { timeout = 10000, interval = 100 } = options;
    const startTime = Date.now();

    let lastPosition: { x: number; y: number } | null = null;

    while (Date.now() - startTime < timeout) {
      try {
        const box = await locator.boundingBox();
        if (box) {
          const currentPosition = { x: box.x, y: box.y };

          if (
            lastPosition &&
            Math.abs(currentPosition.x - lastPosition.x) < 1 &&
            Math.abs(currentPosition.y - lastPosition.y) < 1
          ) {
            return; // Element is stable
          }

          lastPosition = currentPosition;
        }

        await new Promise(resolve => setTimeout(resolve, interval));
      } catch {
        // Element might not be visible yet
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  /**
   * Takes a screenshot with enhanced options
   */
  static async takeTimestampedScreenshot(
    page: Page,
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const fullPath = options.path || `screenshots/${filename}`;

    try {
      await page.screenshot({
        path: fullPath,
        fullPage: options.fullPage ?? true,
        timeout: options.timeout ?? 10000,
      });

      console.log(`Screenshot saved: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.warn(`Failed to take screenshot ${fullPath}:`, error);
      throw error;
    }
  }

  /**
   * Takes a screenshot of a specific element
   */
  static async takeElementScreenshot(locator: Locator, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `element-${name}-${timestamp}.png`;
    const fullPath = `screenshots/${filename}`;

    try {
      await locator.screenshot({ path: fullPath });
      console.log(`Element screenshot saved: ${fullPath}`);
      return fullPath;
    } catch (error) {
      console.warn(`Failed to take element screenshot ${fullPath}:`, error);
      throw error;
    }
  }

  /**
   * Scrolls to element if not in viewport
   */
  static async scrollToElement(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Enhanced viewport visibility check
   */
  static async isElementInViewport(
    locator: Locator,
    options: { threshold?: number } = {}
  ): Promise<boolean> {
    const { threshold = 0.5 } = options;

    try {
      const box = await locator.boundingBox();
      if (!box) return false;

      const page = locator.page();
      const viewport = page.viewportSize();
      if (!viewport) return false;

      const visibleWidth = Math.max(
        0,
        Math.min(box.x + box.width, viewport.width) - Math.max(box.x, 0)
      );
      const visibleHeight = Math.max(
        0,
        Math.min(box.y + box.height, viewport.height) - Math.max(box.y, 0)
      );

      const visibleArea = visibleWidth * visibleHeight;
      const totalArea = box.width * box.height;

      return visibleArea / totalArea >= threshold;
    } catch {
      return false;
    }
  }

  /**
   * Ensures element is visible and interactable
   */
  static async ensureElementVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 10000 });

    if (!(await this.isElementInViewport(locator))) {
      await locator.scrollIntoViewIfNeeded();
      await this.waitForElementStable(locator);
    }

    // Ensure element is not covered by other elements
    const isEnabled = await locator.isEnabled();
    if (!isEnabled) {
      throw new Error('Element is not interactable');
    }
  }

  /**
   * Retries an action with configurable backoff strategy
   */
  static async retryWithBackoff<T>(
    action: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const { maxRetries = 3, initialDelay = 1000, backoffMultiplier = 2 } = options;

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const result = await action();
        if (attempt > 0) {
          console.log(`Action succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
          const errorMessage = lastError.message || 'Unknown error';
          console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, errorMessage);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`All ${maxRetries} attempts failed`);
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Retries an action until a condition is met
   */
  static async retryUntil<T>(
    action: () => Promise<T>,
    condition: (result: T) => boolean,
    options: RetryOptions & WaitOptions = {}
  ): Promise<T> {
    const { maxRetries = 10, timeout = 30000, interval = 1000 } = options;
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < maxRetries && Date.now() - startTime < timeout) {
      try {
        const result = await action();
        if (condition(result)) {
          return result;
        }

        attempt++;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Condition not met after ${maxRetries} attempts or ${timeout}ms timeout`);
  }

  /**
   * Validates Norwegian phone number format
   */
  static isValidNorwegianPhone(phone: string): boolean {
    const cleanedPhone = phone.replace(/\s/g, '');
    const norwegianPhoneRegex = /^(\+47)?[49]\d{7}$/;
    return norwegianPhoneRegex.test(cleanedPhone);
  }

  /**
   * Generates comprehensive test report data
   */
  static generateTestReport(
    testName: string,
    status: 'PASSED' | 'FAILED' | 'SKIPPED',
    duration: number,
    options: {
      error?: string;
      screenshots?: string[];
      browserName?: string;
      viewport?: { width: number; height: number };
      url?: string;
      userAgent?: string;
    } = {}
  ) {
    return {
      testName,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      error: options.error || null,
      screenshots: options.screenshots || [],
      environment: {
        browser: options.browserName || 'unknown',
        viewport: options.viewport || null,
        url: options.url || null,
        userAgent: options.userAgent || null,
      },
    };
  }

  /**
   * Validates page accessibility
   */
  static async validateAccessibility(page: Page): Promise<boolean> {
    try {
      // Check for basic accessibility requirements
      const missingAlt = await page.locator('img:not([alt])').count();
      const missingLabels = await page
        .locator('input:not([aria-label]):not([aria-labelledby]):not([title])')
        .count();

      if (missingAlt > 0) {
        console.warn(`Found ${missingAlt} images without alt text`);
      }

      if (missingLabels > 0) {
        console.warn(`Found ${missingLabels} inputs without labels`);
      }

      return missingAlt === 0 && missingLabels === 0;
    } catch (error) {
      console.warn('Accessibility validation failed:', error);
      return false;
    }
  }

  /**
   * Waits for and validates page performance
   */
  static async validatePagePerformance(page: Page): Promise<{
    loadTime: number;
    domNodes: number;
    performance: 'good' | 'fair' | 'poor';
  }> {
    const startTime = Date.now();
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    const domNodes = await page.locator('*').count();

    let performance: 'good' | 'fair' | 'poor' = 'good';
    if (loadTime > 5000 || domNodes > 3000) {
      performance = 'poor';
    } else if (loadTime > 3000 || domNodes > 2000) {
      performance = 'fair';
    }

    return { loadTime, domNodes, performance };
  }
}
