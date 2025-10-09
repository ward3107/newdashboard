# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Error Boundaries**: Global and route-level error boundaries with graceful fallback UI
  - Reusable `ErrorBoundary` component with Hebrew RTL support
  - Try again and reload functionality
  - Development mode error details
  - Ready for Sentry/logging integration
  - Comprehensive unit tests

- **Loading States**: Accessible loading components for better UX
  - `Loading` component with full-screen and inline variants
  - `Skeleton` component for content placeholders
  - `CardSkeleton` and `TableSkeleton` for specific use cases
  - Proper ARIA attributes for accessibility
  - Comprehensive unit tests

- **Testing Infrastructure**: Complete testing setup with Vitest
  - Vitest test runner with React Testing Library
  - Coverage reporting with 70% threshold
  - Test UI with `npm run test:ui`
  - 20 passing tests for core components
  - Mock setup for window objects

- **PWA Support**: Progressive Web App functionality
  - Service worker with Workbox
  - Offline support with app shell caching
  - Web app manifest with RTL configuration
  - NetworkFirst caching for API calls
  - Installable on mobile and desktop

- **CI/CD**: GitHub Actions workflow
  - Automated testing on push and PR
  - TypeScript type checking
  - Multi-version Node.js testing (18.x, 20.x)
  - Code coverage reporting
  - Security audits
  - Secret detection
  - Accessibility checks placeholder

- **Documentation**: Architecture Decision Records (ADR)
  - ADR 001: Error Boundaries Implementation
  - ADR 002: Loading States and Skeletons
  - ADR 003: Testing Infrastructure
  - ADR 004: PWA Implementation

### Changed
- **Code Splitting**: Improved bundle optimization
  - Implemented React.lazy for route components
  - Manual chunks for vendor libraries
  - Reduced main bundle from 1.48MB to 3.82KB (99.7% reduction)
  - Separate chunks for React, UI libraries, charts, and export tools

- **Environment Variables**: Centralized configuration
  - Moved hardcoded URLs to environment variables
  - Created `.env.example` for documentation
  - Updated `.gitignore` to prevent secret commits
  - Config file reads from `import.meta.env`

- **HTML**: Fixed language and direction attributes
  - Changed `lang="en"` to `lang="he"`
  - Added `dir="rtl"` for proper RTL support
  - Updated page title to Hebrew

- **Dependencies**: Cleaned up package.json
  - Removed deprecated `react-query` v3
  - Kept only `@tanstack/react-query` v5
  - Added testing dependencies
  - Added PWA dependencies

### Removed
- Duplicate component files in `src/components/`
- Deprecated React Query v3 package
- Hard-coded API credentials from config files
- Mock data enabled by default in production

### Fixed
- Large bundle size warning (from 1.48MB to split chunks)
- Missing language attribute in HTML
- Missing accessibility attributes on loading states
- No error handling for component crashes
- No test coverage

### Security
- API keys moved to environment variables
- `.env` added to `.gitignore`
- Secrets detection in CI pipeline
- Google Apps Script uses PropertiesService for API keys
- No credentials in repository

## [1.0.0] - Previous Release

### Added
- Initial React dashboard with Vite
- Claude AI integration for student analysis
- Google Apps Script backend
- RTL Hebrew interface
- Student detail pages
- Export to PDF and Excel
- Charts and analytics
- Responsive design

---

## Migration Guide

### For Developers

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Install new dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Build and verify**
   ```bash
   npm run build
   npm run preview
   ```

### Breaking Changes
- None in this release

### Deprecations
- `react-query` package (use `@tanstack/react-query` instead)

---

## Contributors
- Enhanced with Claude AI assistance
- Built with ❤️ in Israel
