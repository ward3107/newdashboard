# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ISHEBOT (Intelligent Student Holistic Evaluation & Behavior Optimization Tool) is an AI-powered educational platform for analyzing student learning styles, generating personalized recommendations, and optimizing classroom seating arrangements.

## Development Commands

### Frontend (React + Vite)
```bash
# Development
npm run dev                    # Start dev server (http://localhost:5173)

# Type Checking & Linting
npm run typecheck             # TypeScript type checking (runs before build)
npm run lint                  # ESLint full check
npm run lint:errors           # ESLint errors only (used in prebuild)
npm run lint:fix              # Auto-fix ESLint issues

# Building
npm run build                 # Production build (runs prebuild checks)
npm run build:prod            # Same as build
npm run build:analyze         # Build + generate bundle analysis
npm run preview               # Preview production build

# Testing
npm test                      # Run unit tests (vitest)
npm run test:watch            # Watch mode
npm run test:coverage         # Generate coverage report
npm run test:int              # Integration tests
npm run e2e                   # Playwright E2E tests
npm run e2e:headed            # E2E with visible browser
npm run e2e:debug             # E2E debug mode
npm run test:offline          # Specific offline assessment test

# Security & Quality
npm run scan:deps             # Audit dependencies
npm run scan:security         # Security scan
npm run security:audit        # Full security audit (bash script)
npm run a11y                  # Accessibility tests
npm run perf                  # Performance tests

# CI Pipeline
npm run precommit             # Lint + typecheck + test
npm run ci                    # Full CI pipeline (without integration tests)
npm run ci:full               # Complete CI with all tests
```

### Backend (Python FastAPI)
```bash
cd backend

# Setup
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Development
uvicorn app.main:app --reload              # Start server (http://localhost:8000)
uvicorn app.main:app --reload --port 8080  # Custom port

# API Documentation
# Visit http://localhost:8000/docs (Swagger)
# Visit http://localhost:8000/redoc (ReDoc)
```

## Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 7 (ES2020 target)
- **State**: React Query (@tanstack/react-query) + Context API
- **Routing**: React Router v6 with protected routes
- **Styling**: TailwindCSS + Framer Motion
- **i18n**: i18next with 4 languages (Hebrew, English, Arabic, Russian)

### Backend Stack
- **API**: FastAPI with Pydantic v2
- **Optimization**: DEAP (genetic algorithms) for classroom seating
- **Hosting**: Designed for Railway/Render deployment

### Data Sources (Dual Mode)
The app supports **two data source modes** controlled by `VITE_USE_FIRESTORE`:

1. **Firestore Mode** (`VITE_USE_FIRESTORE=true`):
   - Primary: Firebase Firestore (`src/services/firestoreApi.ts`)
   - Firebase Auth for authentication
   - Data structure: `schools/{schoolId}/students/{studentId}`

2. **Google Sheets Mode** (`VITE_USE_FIRESTORE=false`):
   - Google Apps Script API (`src/services/api.ts`)
   - Requires `VITE_API_URL` pointing to deployed Apps Script

**Fallback**: If APIs are unconfigured, mock data is used automatically.

### Authentication System

**Dual Authentication** (configured in `src/contexts/AuthContext.tsx`):

1. **Firebase Auth** (production):
   - Email/password + Google OAuth
   - Role-based access control (teacher, admin)
   - User data stored in Firestore `users` collection

2. **Mock Auth** (development/testing):
   - Automatically enabled when Firebase env vars are missing
   - Test accounts in `src/utils/mockAuth.ts`:
     - `teacher@test.com` / `teacher123`
     - `admin@test.com` / `admin123`
     - `manager@test.com` / `manager123`

### Key Files to Understand

**Entry Points:**
- `src/main.tsx` - App initialization
- `src/App.tsx` - Router configuration, lazy loading, security initialization
- `backend/app/main.py` - FastAPI app setup

**Routing:**
All routes are defined in `src/App.tsx` with role-based protection:
- Public: `/`, `/login`, `/assessment`, `/privacy-policy`, `/terms`
- Teacher/Admin: `/dashboard`, `/student/:id`, `/classroom-optimization`, `/api-test`
- Admin only: `/admin`, `/security-dashboard`

**Authentication Flow:**
1. `AuthContext` listens to Firebase auth state or mock session
2. `ProtectedRoute` component checks user role
3. Redirects to `/login` if unauthorized

**Data Flow:**
1. API calls go through `src/services/api.ts` (main router)
2. Routes to either `firestoreApi.ts` or Google Sheets based on config
3. React Query caches responses with 5min stale time
4. Dashboard components use `useQuery` hooks

**Code Splitting:**
- Lazy loading configured in `App.tsx` with React.lazy()
- Manual chunks in `vite.config.ts` for optimized bundles
- Heavy libraries (exceljs, jspdf) split into separate chunks

## Important Patterns

### Logging
- **Never use `console.log` directly in production code**
- Use `logger` utility from `src/utils/logger.ts`
- Logger is dev-only; automatically silent in production builds
- Build process strips console.log via terser config

### Error Handling
- All components wrapped in `ErrorBoundary` (`src/components/common/ErrorBoundary.tsx`)
- API errors sanitized to prevent info leakage (IP addresses, paths removed)

### Internationalization
- Use `useTranslation()` hook from react-i18next
- Translation files in `src/i18n/`
- RTL support for Hebrew and Arabic (controlled via `dir` attribute)

### Security Features
- CSP (Content Security Policy) - `src/security/csp.ts`
- Rate limiting - `src/security/rateLimiter.ts`
- CSRF protection - `src/security/securityEnhancements.ts`
- Firestore security rules in `firestore.rules`

### Performance
- Real User Monitoring (RUM) - `src/monitoring/rum.ts`
- Web Vitals tracking - `src/utils/performanceMonitoring.ts`
- Service Worker (PWA) via VitePWA plugin

## Environment Variables

### Required Frontend Variables
```bash
# Firebase (Production)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Data Source Configuration
VITE_USE_FIRESTORE=true           # true=Firestore, false=Google Sheets
VITE_SCHOOL_ID=ishebott           # Firestore school identifier
VITE_API_URL=                     # Google Apps Script URL (if not using Firestore)
```

### Optional Variables
```bash
VITE_USE_MOCK_DATA=false          # Force mock data mode
VITE_OPTIMIZATION_API_URL=        # Backend API URL for genetic algorithm
```

### Backend Variables
```bash
SECRET_KEY=                       # 43+ character secret key
ALLOWED_ORIGINS=                  # Comma-separated CORS origins
DEBUG=false                       # Enable debug mode
LOG_LEVEL=INFO                    # Logging level
```

## Testing Notes

### Test Structure
- Unit tests: `src/**/*.test.ts(x)` with vitest
- E2E tests: `tests/e2e/*.spec.ts` with Playwright
- Test setup: `src/test/setup.ts`
- Mock Service Worker: `public/mockServiceWorker.js`

### Running Specific Tests
```bash
vitest run src/services/api.test.ts           # Single test file
vitest run --grep "authentication"            # Pattern match
playwright test tests/e2e/offline-assessment  # Single E2E test
```

## Common Tasks

### Adding a New Protected Route
1. Add lazy import in `App.tsx`
2. Add `<Route>` with `<ProtectedRoute>` wrapper
3. Specify `requiredRoles` or `requiredRole` prop

### Adding a New API Endpoint
**Frontend:**
1. Add function to `src/services/api.ts`
2. Add Firestore equivalent to `src/services/firestoreApi.ts`
3. Add React Query key to `queryKeys` object

**Backend:**
1. Create route in `backend/app/api/routes/`
2. Add models in `backend/app/models/`
3. Include router in `main.py`

### Updating Translations
1. Edit `src/i18n/locales/{lang}.json`
2. For Hebrew/Arabic: ensure proper RTL text
3. Test with `LanguageSwitcher` component

### Deployment Checklist
1. Set environment variables in hosting platform
2. Ensure `VITE_USE_FIRESTORE` matches data source
3. Configure Firestore security rules (if using Firebase)
4. Backend: Set `SECRET_KEY` and `ALLOWED_ORIGINS`
5. Frontend build includes all required env vars

## Git Workflow

**Pre-commit Checks** (manual):
```bash
npm run precommit    # Lint, typecheck, and test
```

**Security Checks:**
```bash
npm run security:check-secrets    # Scan for secrets in staged files
```

**Commit Message Format:**
Recent commits show this pattern:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code restructuring
- Include "Generated with Claude Code" attribution if using AI

## Debugging Tips

### API Connection Issues
1. Check `VITE_USE_FIRESTORE` setting
2. Test with `/api-test` route (requires teacher/admin login)
3. Check browser console for API errors
4. Verify Firebase config if using Firestore

### Authentication Problems
1. Look for "USING MOCK AUTHENTICATION" warning in console
2. Check Firebase Auth user in Firebase console
3. Verify user has `users/{uid}` document in Firestore
4. Check user `isActive` field and `role` field

### Build Failures
1. Run `npm run typecheck` first (catches most issues)
2. Check terser compression warnings (manualChunks config)
3. Large bundle warnings indicate new heavy dependency

### Firestore Permission Errors
1. Review `firestore.rules`
2. Ensure user is authenticated
3. Check `schoolId` matches in queries
4. Use Firebase Firestore Rules Playground for testing

## Special Considerations

- **Hebrew is the default language** (RTL layout)
- **Don't modify terser config** - console.log removal is intentional
- **Never commit `.env` files** - use `.env.example` as template
- **Backend CORS must include frontend domain** for API to work
- **PWA disabled in dev** to prevent caching issues
- **Service worker may need clearing** after major updates

## Code Quality Standards

- TypeScript strict mode enabled
- ESLint enforces React hooks rules, a11y, and security checks
- Prettier not configured (relies on ESLint --fix)
- CSS uses Tailwind utility classes primarily
- Components follow atomic design (ui/ for shared components)
