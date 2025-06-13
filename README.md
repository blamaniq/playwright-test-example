# Finn.no Property Search - Automated Test Suite

## Overview

This test suite provides comprehensive automated testing for real estate search platform using Playwright and TypeScript.

## Project Structure

```
playwright-test-example/
├── tests/
│   ├── pages/           # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── SearchPage.ts
│   │   └── PropertyDetailsPage.ts
│   ├── fixtures/        # Test data
│   │   └── testData.json
│   ├── utils/          # Helper functions
│   │   └── helpers.ts
│   └── specs/          # Test specifications
│       ├── propertySearch.spec.ts
│       └── propertyDetails.spec.ts
├── playwright.config.ts # Playwright configuration
└── package.json
```

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Install Playwright browsers:**

   ```bash
   npx playwright install
   ```

3. **Create screenshots directory:**
   ```bash
   mkdir screenshots
   ```

## Running Tests

**Run all tests:**

```bash
npx playwright test
```

**Run specific test file:**

```bash
npx playwright test tests/specs/propertySearch.spec.ts
```

**Run tests in headed mode:**

```bash
npx playwright test --headed
```

**Run tests in specific browser:**

```bash
npx playwright test --project=chromium
```

**Generate HTML report:**

```bash
npx playwright show-report
```

## Test Coverage

### Property Search Tests

- ✅ Search by location and price range
- ✅ Verify search results accuracy
- ✅ Invalid parameter handling
- ✅ Multiple filter combinations
- ✅ Sorting functionality
- ✅ Map view toggle

### Property Details Tests

- ✅ Comprehensive information display
- ✅ Image gallery navigation
- ✅ Contact form functionality
- ✅ Agent information display
- ✅ Viewing schedule information
- ✅ Favorite functionality
- ✅ Mobile responsiveness

## Key Design Decisions

1. **Page Object Model**: Separates test logic from page structure for maintainability
2. **Data-Driven Testing**: Externalized test data in JSON for easy updates
3. **Reusable Utilities**: Common functions centralized in helpers
4. **Cross-Browser Testing**: Configured for Chrome, Firefox, Safari, and mobile
5. **Screenshot Documentation**: Automatic screenshots on failures and key steps

## CI/CD Integration

The framework is designed for easy CI/CD integration with:

- Configurable retry mechanisms
- Parallel execution support
- HTML and video reporting
- Environment-based configuration

## Best Practices Implemented

- Explicit waits over implicit waits
- Robust error handling
- Meaningful test descriptions
- Isolated test execution
- Comprehensive logging
