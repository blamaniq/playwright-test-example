module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Playwright-specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off', // Allow console.log in tests
    'no-debugger': 'error',
    
    // Test-specific rules
    'no-duplicate-imports': 'error',
    'no-unreachable': 'error',
    'no-unused-expressions': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'test-results/',
    'playwright-report/',
    '*.js'
  ],
};