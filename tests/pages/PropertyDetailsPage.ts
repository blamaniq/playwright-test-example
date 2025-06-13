import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PropertyInfo {
  title: string;
  price: string;
  address: string;
  size: string;
  type: string;
  description: string;
}

export interface AgentInfo {
  name: string;
  phone: string;
  email: string;
  company: string;
}

export class PropertyDetailsPage extends BasePage {
  // Main property information
  private readonly propertyTitle: Locator;
  private readonly propertyPrice: Locator;
  private readonly propertyAddress: Locator;
  private readonly propertySize: Locator;
  private readonly propertyType: Locator;
  private readonly propertyDescription: Locator;

  // Image gallery
  private readonly imageGallery: Locator;
  private readonly galleryImages: Locator;
  private readonly nextImageButton: Locator;
  private readonly previousImageButton: Locator;
  private readonly imageCounter: Locator;

  // Contact and interaction
  private readonly contactButton: Locator;
  private readonly favoriteButton: Locator;

  // Agent information
  private readonly agentInfo: Locator;
  private readonly agentName: Locator;
  private readonly agentPhone: Locator;
  private readonly agentEmail: Locator;

  // Viewing information
  private readonly viewingInfo: Locator;

  constructor(page: Page) {
    super(page);

    // Property information with robust selectors
    this.propertyTitle = page
      .locator('[data-testid="ad-title"], h1[class*="title"], h1:has-text(" ")')
      .first();
    this.propertyPrice = page
      .locator(
        '[data-testid="pricing-incicative-price"], [data-testid="price"], [class*="price"]:has-text("kr")'
      )
      .first();
    this.propertyAddress = page
      .locator('[data-testid="object-address"], [class*="address"], [class*="location"]')
      .first();
    this.propertySize = page
      .locator('dt:has-text("Primærrom") + dd, dt:has-text("Areal") + dd, text=/\\d+\\s*m²/')
      .first();
    this.propertyType = page
      .locator('dt:has-text("Boligtype") + dd, dt:has-text("Type") + dd, [class*="property-type"]')
      .first();
    this.propertyDescription = page
      .locator('[data-testid="ad-description"], [class*="description"], [class*="text-content"]')
      .first();

    // Image gallery elements
    this.imageGallery = page.locator(
      '[data-testid="image-gallery"], [class*="gallery"], [class*="carousel"]'
    );
    this.galleryImages = this.imageGallery.locator('img');
    this.nextImageButton = page.locator(
      'button[aria-label*="neste"], button[aria-label*="next"], [class*="next"]'
    );
    this.previousImageButton = page.locator(
      'button[aria-label*="forrige"], button[aria-label*="previous"], [class*="prev"]'
    );
    this.imageCounter = page.locator(
      // eslint-disable-next-line no-useless-escape
      '[class*="counter"], [class*="indicator"], text=/\\d+\\s*\/\\s*\\d+/'
    );

    // Contact and interaction buttons
    this.contactButton = page
      .locator(
        'button:has-text("Kontakt"), button:has-text("Contact"), [data-testid="contact-button"]'
      )
      .first();
    this.favoriteButton = page
      .locator(
        'button[aria-label*="favoritt"], button[aria-label*="favorite"], [data-testid="favorite-button"]'
      )
      .first();

    // Agent information
    this.agentInfo = page.locator(
      '[data-testid="broker-card"], [class*="agent"], [class*="broker"]'
    );
    this.agentName = this.agentInfo.locator('[class*="name"], h3, h4, strong').first();
    this.agentPhone = this.agentInfo
      .locator('a[href^="tel:"], [class*="phone"], text=/\\d{8}/')
      .first();
    this.agentEmail = this.agentInfo.locator('a[href^="mailto:"], [class*="email"]').first();

    // Viewing information
    this.viewingInfo = page.locator(
      'section:has-text("Visning"), [data-testid="viewing"], [class*="viewing"]'
    );
  }

  async getPropertyTitle(): Promise<string> {
    try {
      await this.propertyTitle.waitFor({ timeout: 10000 });
      return (await this.propertyTitle.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getPropertyPrice(): Promise<string> {
    try {
      await this.propertyPrice.waitFor({ timeout: 5000 });
      return (await this.propertyPrice.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getPropertyAddress(): Promise<string> {
    try {
      await this.propertyAddress.waitFor({ timeout: 5000 });
      return (await this.propertyAddress.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getPropertySize(): Promise<string> {
    try {
      await this.propertySize.waitFor({ timeout: 5000 });
      return (await this.propertySize.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getPropertyType(): Promise<string> {
    try {
      await this.propertyType.waitFor({ timeout: 5000 });
      return (await this.propertyType.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getCompletePropertyInfo(): Promise<PropertyInfo> {
    return {
      title: await this.getPropertyTitle(),
      price: await this.getPropertyPrice(),
      address: await this.getPropertyAddress(),
      size: await this.getPropertySize(),
      type: await this.getPropertyType(),
      description: await this.getPropertyDescription(),
    };
  }

  async getPropertyDescription(): Promise<string> {
    try {
      await this.propertyDescription.waitFor({ timeout: 5000 });
      return (await this.propertyDescription.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async navigateImageGallery(direction: 'next' | 'previous'): Promise<void> {
    const button = direction === 'next' ? this.nextImageButton : this.previousImageButton;

    if (await button.isVisible({ timeout: 2000 })) {
      await button.click();
      // Wait for image transition animation
      await this.page.waitForTimeout(800);
    } else {
      throw new Error(`${direction} button is not visible in image gallery`);
    }
  }

  async getImageCount(): Promise<number> {
    try {
      if (await this.imageCounter.isVisible({ timeout: 2000 })) {
        const counterText = await this.imageCounter.textContent();
        const match = counterText?.match(/(\d+)\s*\/\s*(\d+)/);
        return match ? parseInt(match[2]) : 0;
      }

      // Fallback: count actual images
      return await this.galleryImages.count();
    } catch {
      return 0;
    }
  }

  async getCurrentImageIndex(): Promise<number> {
    try {
      if (await this.imageCounter.isVisible({ timeout: 2000 })) {
        const counterText = await this.imageCounter.textContent();
        const match = counterText?.match(/(\d+)\s*\/\s*(\d+)/);
        return match ? parseInt(match[1]) : 1;
      }
      return 1;
    } catch {
      return 1;
    }
  }

  async clickContactAgent() {
    await this.contactButton.click();
    await this.page.waitForTimeout(1000);
  }

  async toggleFavorite() {
    await this.favoriteButton.click();
  }

  async isPropertyInfoComplete(): Promise<boolean> {
    const requiredElements = [
      { locator: this.propertyTitle, name: 'title' },
      { locator: this.propertyPrice, name: 'price' },
      { locator: this.propertyAddress, name: 'address' },
    ];

    for (const { locator, name } of requiredElements) {
      try {
        await locator.waitFor({ timeout: 5000 });
        const text = await locator.textContent();
        if (!text || text.trim().length === 0) {
          console.warn(`Property ${name} is empty or missing`);
          return false;
        }
      } catch (error) {
        console.warn(`Property ${name} element not found:`, error);
        return false;
      }
    }

    return true;
  }

  async waitForPageLoad(): Promise<void> {
    await Promise.all([
      this.propertyTitle.waitFor({ timeout: 15000 }),
      this.propertyPrice.waitFor({ timeout: 10000 }).catch(() => {}), // Price might not always be visible
      this.propertyAddress.waitFor({ timeout: 10000 }),
    ]);
  }

  async getAgentName(): Promise<string> {
    try {
      await this.agentInfo.waitFor({ timeout: 5000 });
      return (await this.agentName.textContent())?.trim() || '';
    } catch {
      return '';
    }
  }

  async getCompleteAgentInfo(): Promise<AgentInfo> {
    try {
      await this.agentInfo.waitFor({ timeout: 5000 });

      const name = (await this.agentName.textContent()) || '';
      const phone = (await this.agentPhone.textContent()) || '';
      const email = (await this.agentEmail.textContent()) || '';
      const company =
        (await this.agentInfo
          .locator('[class*="company"], [class*="agency"]')
          .first()
          .textContent()) || '';

      return {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        company: company.trim(),
      };
    } catch {
      return { name: '', phone: '', email: '', company: '' };
    }
  }

  async hasViewingScheduled(): Promise<boolean> {
    return await this.viewingInfo.isVisible();
  }

  async getViewingDetails(): Promise<string> {
    if (await this.hasViewingScheduled()) {
      return (await this.viewingInfo.textContent()) || '';
    }
    return 'No viewing scheduled';
  }
}
