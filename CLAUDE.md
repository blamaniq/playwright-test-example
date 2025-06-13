# CLAUDE.md

⚡ **Framework Status**: Production-ready with enterprise-level features

This file provides guidance to Claude Code (claude.ai/code) when working with this enhanced Playwright automation framework.

## Common Commands

### Test Execution
- `npm test` - Run all tests
- `npm run test:headed` - Run tests in headed mode  
- `npm run test:debug` - Run tests in debug mode
- `npm run test:ui` - Run tests in UI mode
- `npm run test:chromium` - Run tests in Chromium only
- `npm run test:firefox` - Run tests in Firefox only
- `npm run test:webkit` - Run tests in WebKit only
- `npm run test:mobile` - Run mobile tests
- `npm run test:responsive` - Run responsive/cross-browser tests
- `npm run test:parallel` - Run tests with 4 workers
- `npm run test:report` - View HTML report

### Specific Test Files
- `npm run test:search` - Run property search tests
- `npm run test:details` - Run property details tests
- `npx playwright test tests/specs/crossBrowserResponsive.spec.ts` - Run cross-browser tests

### Setup and Dependencies
- `npm install` - Install dependencies
- `npm run test:install` - Install Playwright browsers
- `npm run test:install-deps` - Install browser dependencies

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Development
- `npx playwright codegen https://www.finn.no` - Generate test code
- `npx playwright test --debug` - Debug specific test
- `npx playwright show-trace` - View trace files

## Architecture Overview

This is an enterprise-grade Playwright automation framework for finn.no property search functionality using TypeScript and enhanced Page Object Model patterns.

### Key Architecture Components

**Enhanced Page Object Model:**
- `BasePage.ts` - Base class with common functionality
- `SearchPage.ts` - Robust search functionality with fallback locators
- `PropertyDetailsPage.ts` - Comprehensive property information handling
- TypeScript interfaces for search filters and property data
- Multiple locator strategies for stability

**Advanced Test Data Management:**
- `testData.ts` - TypeScript-based test data with full type safety
- Interfaces: `SearchFilters`, `PropertyInfo`, `AgentInfo`
- Helper functions: `getRandomLocation()`, `getRandomPriceRange()`
- Validation functions for data integrity
- Separate valid/invalid datasets for comprehensive testing

**Comprehensive Utility Layer:**
- Enhanced `TestHelpers` class with advanced retry logic
- Performance and accessibility validation
- Element stability checking and viewport management
- Screenshot utilities with metadata
- Network idle waiting and error handling

**Professional Configuration:**
- 6 browser configurations (Desktop + Mobile + Tablet)
- Norwegian locale and timezone settings
- Multiple reporters (HTML, JUnit, JSON, GitHub)
- Global setup with environment validation
- Configurable timeouts and retry strategies
- CI/CD integration with artifact management

### Test Organization
- **Core Tests**: `propertySearch.spec.ts`, `propertyDetails.spec.ts`
- **Cross-browser/Responsive**: `crossBrowserResponsive.spec.ts`
- **Test Data**: Centralized in `tests/fixtures/testData.ts` with TypeScript interfaces
- **Page Objects**: Enhanced with robust locators and error handling
- **Utilities**: Comprehensive helper functions in `tests/utils/helpers.ts`

### Framework Features
- **TypeScript Support**: Full type safety with interfaces for test data
- **Multi-browser Testing**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari, Tablet
- **Responsive Testing**: Multiple viewport sizes and device simulation
- **Retry Logic**: Exponential backoff and configurable retry strategies  
- **Enhanced Reporting**: HTML, JUnit, JSON, and GitHub Actions integration
- **Performance Testing**: Page load time and accessibility validation
- **CI/CD Ready**: GitHub Actions workflow with artifact uploads

### Norwegian Context
- Tests validate Norwegian phone number formats
- Uses Norwegian language assertions and error messages  
- Handles Norwegian cookie consent ("Godta alle")
- Configured for Norwegian locale (nb-NO) and timezone (Europe/Oslo)

## Framework Improvements Made

### Enhanced Locator Strategies
- Multiple fallback selectors for robustness
- Data-testid prioritization with CSS fallbacks
- Accessibility-aware element selection
- Mobile-responsive locator handling

### Advanced Error Handling
- Graceful degradation for missing elements
- Retry mechanisms with exponential backoff
- Comprehensive timeout management
- Test skipping for unavailable functionality

### Performance & Quality
- Page load performance monitoring
- Basic accessibility validation
- Cross-browser compatibility testing
- Responsive design validation across viewports

### CI/CD Integration
- GitHub Actions workflow with matrix testing
- Artifact collection (screenshots, videos, reports)
- Automated PR comments with test results
- Scheduled daily test runs

## Best Practices Implemented

1. **Type Safety**: Full TypeScript interfaces for all data structures
2. **Maintainability**: Clear separation of concerns and reusable components  
3. **Reliability**: Robust error handling and retry mechanisms
4. **Scalability**: Configurable test execution and parallel processing
5. **Observability**: Comprehensive logging and reporting
6. **Security**: XSS and injection attack testing
7. **Performance**: Load time monitoring and optimization detection