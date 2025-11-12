# 🛠️ Technology Stack & Routing - Complete Reference

> Comprehensive guide to all technologies, libraries, and routing configuration

---

## 📚 Technology Stack Overview

### Frontend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Language** | TypeScript | 5.9.3 | Type safety |
| **Build Tool** | Vite | 7.1.10 | Fast builds |
| **Routing** | React Router | 6.30.1 | SPA routing |
| **State Management** | React Query | 5.90.2 | Server state |
| **State (Local)** | React Context | Built-in | Auth, theme |
| **Styling** | Tailwind CSS | 3.4.18 | Utility-first CSS |
| **Animation** | Framer Motion | 12.23.22 | Animations |
| **Icons** | Lucide React | 0.544.0 | Icon library |
| **Forms** | React Hook Form | (via resolvers) | Form validation |
| **Validation** | Zod | 4.1.12 | Schema validation |
| **i18n** | i18next | 25.6.0 | Internationalization |
| **HTTP Client** | Axios | 1.6.2 | API calls |
| **Notifications** | React Hot Toast | 2.6.0 | Toast messages |

### Backend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | FastAPI | Latest | Python web framework |
| **Language** | Python | 3.10+ | Backend logic |
| **Algorithm** | DEAP | Latest | Genetic algorithms |
| **CORS** | FastAPI CORS | Built-in | Cross-origin requests |

### Database & Services

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Database** | Firestore | Latest | NoSQL database |
| **Authentication** | Firebase Auth | 12.5.0 | User authentication |
| **Cloud Functions** | Firebase Functions | 13.5.0 | Serverless functions |
| **Alternative DB** | Google Sheets | N/A | Legacy data source |
| **AI Service** | Claude Sonnet 4 | 20250514 | AI analysis |
| **Alternative AI** | OpenAI GPT-4o-mini | Latest | Cloud function AI |

### Charts & Data Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| Recharts | 3.2.1 | Interactive charts |
| Chart.js | 4.5.1 | Statistical charts |
| react-chartjs-2 | 5.3.0 | React wrapper |

### File Operations

| Library | Version | Purpose |
|---------|---------|---------|
| jsPDF | 3.0.3 | PDF generation |
| html2canvas | 1.4.1 | HTML to canvas |
| ExcelJS | 4.4.0 | Excel export |

### UI Components

| Library | Version | Purpose |
|---------|---------|---------|
| @dnd-kit/core | 6.3.1 | Drag & drop core |
| @dnd-kit/sortable | 10.0.0 | Sortable lists |
| canvas-confetti | 1.9.4 | Celebration effects |
| react-window | 2.2.1 | Virtual lists |

### Testing

| Library | Version | Purpose |
|---------|---------|---------|
| Vitest | 3.2.4 | Unit testing |
| @testing-library/react | 16.3.0 | React testing |
| Playwright | 1.40.0 | E2E testing |
| MSW | 2.0.0 | API mocking |
| Axe Core | 4.8.0 | Accessibility testing |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 8.56.0 | Code linting |
| Prettier | 3.2.0 | Code formatting |
| TypeScript | 5.9.3 | Type checking |
| PostCSS | 8.5.6 | CSS processing |
| Autoprefixer | 10.4.21 | CSS prefixing |

### Build & Optimization

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | 7.1.10 | Build tool |
| Rollup Visualizer | 6.0.5 | Bundle analysis |
| Vite Compression | 0.5.1 | Gzip/Brotli |
| Vite PWA | 1.0.3 | PWA generation |
| Workbox | 7.3.0 | Service worker |

---

## 🗺️ Routing Configuration

### Route Structure (`src/App.tsx`)

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    {/* Legal Pages (Public) */}
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/data-processing" element={<DataProcessingPage />} />
    <Route path="/security" element={<SecurityPage />} />

    {/* Landing Page */}
    <Route path="/" element={<LandingPage />} />

    {/* Main Application Routes */}
    <Route path="/dashboard" element={<FuturisticDashboard />} />
    <Route path="/original" element={<Dashboard />} />
    <Route path="/student/:studentId" element={<StudentDetail />} />
    <Route path="/test-analytics" element={<TestAnalytics />} />
    <Route path="/admin" element={<AdminControlPanel />} />
    <Route path="/api-test" element={<ApiTestPage />} />
    <Route path="/assessment" element={<AssessmentPage />} />
    <Route path="/classroom-optimization" element={<ClassroomOptimizationPage />} />

    {/* 404 Handler */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</Router>
```

---

## 📍 Complete Route Reference

### Public Routes (No Auth Required)

| Route | Component | File | Purpose |
|-------|-----------|------|---------|
| `/` | LandingPage | `pages/HtmlLandingRedirect.tsx` | Landing page redirect |
| `/privacy-policy` | PrivacyPolicyPage | `pages/PrivacyPolicyPage.tsx` | Privacy policy |
| `/terms` | TermsPage | `pages/TermsPage.tsx` | Terms of service |
| `/data-processing` | DataProcessingPage | `pages/DataProcessingPage.tsx` | Data processing info |
| `/security` | SecurityPage | `pages/SecurityPage.tsx` | Security information |

### Main Application Routes

| Route | Component | File | Purpose | Auth |
|-------|-----------|------|---------|------|
| `/dashboard` | FuturisticDashboard | `components/dashboard/FuturisticDashboard.tsx` | **Main dashboard** | Currently disabled |
| `/original` | Dashboard | `components/dashboard/Dashboard.tsx` | Original dashboard version | Currently disabled |
| `/student/:studentId` | StudentDetail | `components/student/StudentDetail.jsx` | Individual student view | Currently disabled |
| `/test-analytics` | TestAnalytics | `components/analytics/TestAnalytics.tsx` | Analytics dashboard | Currently disabled |
| `/admin` | AdminControlPanel | `components/AdminControlPanel.jsx` | Admin operations | Currently disabled |
| `/assessment` | AssessmentPage | `pages/AssessmentPage.tsx` | Student assessment form | Currently disabled |
| `/classroom-optimization` | ClassroomOptimizationPage | `pages/ClassroomOptimizationPage.tsx` | Seating optimization | Currently disabled |
| `/api-test` | ApiTestPage | `pages/ApiTestPage.tsx` | API testing page | Dev only |

### Special Routes

| Route | Handler | Purpose |
|-------|---------|---------|
| `*` | NotFound | 404 error page |

---

## 🎯 Route Details

### `/` - Landing Page

**Component**: `HtmlLandingRedirect.tsx`
**Purpose**: Redirects to HTML landing page
**Features**:
- Initial entry point
- Can redirect to `/dashboard` or `landing.html`
- SEO optimized

**Code**:
```typescript
// Redirects to landing.html
window.location.href = '/landing.html';
```

---

### `/dashboard` - Main Dashboard (PRIMARY ROUTE)

**Component**: `FuturisticDashboard.tsx` (~1000 lines)
**Purpose**: Main application interface
**Features**:
- Student list with cards
- Search and filters
- Statistics cards
- Learning style charts
- Class-based grouping
- Admin panel access
- Batch operations

**Key Sections**:
1. **Header**
   - Logo
   - Search bar
   - Language switcher
   - User menu

2. **Stats Cards**
   - Total students
   - Average strengths
   - By class distribution
   - Last update time

3. **Student Grid**
   - Virtual scrolling
   - Lazy loading
   - Animated cards
   - Click to view details

4. **Sidebar**
   - Filters
   - Class selection
   - Learning style filter
   - Sort options

**File**: `src/components/dashboard/FuturisticDashboard.tsx:1-1000`

---

### `/student/:studentId` - Student Detail

**Component**: `StudentDetail.jsx` (~600 lines)
**Purpose**: Comprehensive student profile
**Dynamic Route**: `:studentId` parameter

**URL Examples**:
- `/student/70101`
- `/student/70132`
- `/student/abc-123`

**Features**:
- Student summary
- Learning style breakdown
- Strengths & challenges
- AI insights
- Immediate actions
- Seating recommendations
- Export options (PDF, Excel)
- ISHEBOT analysis button

**Sections**:
1. **Header**
   - Student name & code
   - Class & quarter
   - Export buttons
   - Analyze button

2. **Summary Card**
   - Learning style
   - Key notes
   - Quick stats

3. **Strengths & Challenges**
   - Visual indicators
   - Count badges
   - Detailed lists

4. **ISHEBOT Analysis** (if available)
   - Stats dashboard
   - Insights cards
   - Recommendations
   - Action items

5. **Seating Arrangement**
   - Recommended location
   - Partner type
   - Avoid list

**File**: `src/components/student/StudentDetail.jsx:1-600`

---

### `/classroom-optimization` - Seating Optimization

**Component**: `ClassroomOptimizationPage.tsx`
**Purpose**: AI-powered classroom seating
**Features**:
- Genetic algorithm optimization
- Multiple objectives
- Visual seating chart
- Export/print options

**Backend Integration**:
- Calls Python FastAPI endpoint
- URL: `VITE_OPTIMIZATION_API_URL/optimize`
- Method: POST
- Payload: Student data + constraints

**File**: `src/pages/ClassroomOptimizationPage.tsx:1-500`

---

### `/assessment` - Student Assessment Form

**Component**: `AssessmentPage.tsx`
**Purpose**: Multi-language student assessment
**Features**:
- 4 languages (he/en/ar/ru)
- 28 questions
- Progress tracking
- Confetti celebration

**Form Flow**:
1. Basic info (code, name, class)
2. 28 questions (one at a time)
3. Submit to Cloud Function
4. Success with confetti

**File**: `src/pages/AssessmentPage.tsx:1-35`
**Form Component**: `src/components/forms/StudentAssessmentForm.tsx:1-800`

---

### `/admin` - Admin Control Panel

**Component**: `AdminControlPanel.jsx` (~640 lines)
**Purpose**: Administrative operations
**Features**:
- Data synchronization
- Batch student analysis
- Cache management
- System diagnostics
- Database operations

**Operations**:
- Sync with Google Sheets
- Analyze all students
- Clear caches
- View system stats
- Export all data

**File**: `src/components/AdminPanel.jsx:1-640`

---

### `/test-analytics` - Analytics Dashboard

**Component**: `TestAnalytics.tsx`
**Purpose**: Advanced analytics and visualizations
**Features**:
- Performance trends
- Learning style distribution
- Class comparisons
- Time-series charts
- Interactive filtering

**Charts**:
- Line charts (performance over time)
- Bar charts (comparisons)
- Pie charts (distributions)
- Area charts (trends)

**File**: `src/components/analytics/TestAnalytics.tsx`

---

### `/api-test` - API Testing Page

**Component**: `ApiTestPage.tsx`
**Purpose**: Developer tool for API testing
**Features**:
- Test API endpoints
- View responses
- Debug issues
- Performance testing

**Access**: Development only

**File**: `src/pages/ApiTestPage.tsx`

---

## 🔒 Authentication Status

**Current Status**: **Authentication is DISABLED**

**Reason**: Disabled for presentation purposes (see `App.tsx:156`)

**Comment in Code**:
```typescript
// Authentication temporarily disabled for presentation
<Route path="/dashboard" element={<FuturisticDashboard />} />
```

**To Enable Authentication**:

1. Wrap routes with `ProtectedRoute`:
```typescript
import ProtectedRoute from './components/auth/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <FuturisticDashboard />
    </ProtectedRoute>
  }
/>
```

2. Uncomment auth checks
3. Configure Firebase Auth
4. Set up login flow

---

## 🎨 Code Splitting Strategy

### Lazy Loading Implementation

```typescript
// Lazy load components for code splitting
const FuturisticDashboard = lazy(() =>
  import(/* webpackChunkName: "futuristic-dashboard" */
  './components/dashboard/FuturisticDashboard')
);

const StudentDetail = lazy(() =>
  import(/* webpackChunkName: "student-detail" */
  './components/student/StudentDetail')
);

// Wrapped in Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<FuturisticDashboard />} />
  </Routes>
</Suspense>
```

### Chunk Strategy (`vite.config.ts`)

**Manual Chunks**:
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'charts': ['recharts', 'chart.js', 'react-chartjs-2'],
  'ui-vendor': ['framer-motion', 'react-hot-toast'],
  'data-vendor': ['@tanstack/react-query', 'axios'],
  'icons': ['lucide-react'],
  'export-xlsx': ['exceljs'],      // Lazy loaded
  'export-pdf': ['jspdf', 'html2canvas'],  // Lazy loaded
  'i18n': ['i18next', 'react-i18next'],
  'forms': ['@hookform/resolvers', 'zod'],
  'date-utils': ['date-fns'],
  'dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
}
```

**Benefits**:
- Faster initial load
- Better caching
- Parallel downloads
- Smaller chunks

---

## 🚀 Performance Optimizations

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,                    // Retry failed requests
      staleTime: 5 * 60 * 1000,   // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes (garbage collection)
    },
  },
});
```

### PWA Configuration

**Workbox Caching**:
```typescript
runtimeCaching: [
  {
    // Google Fonts
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      },
    },
  },
  {
    // API calls
    urlPattern: /^https:\/\/script\.google\.com\/.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      },
    },
  },
]
```

---

## 📊 Bundle Size Analysis

**Run**: `npm run build:analyze`

**Typical Sizes**:
```
Main Bundle:        ~200 KB (gzipped)
React Vendor:       ~150 KB (gzipped)
Charts:             ~100 KB (gzipped)
UI Vendor:          ~80 KB (gzipped)
Export XLSX:        ~120 KB (lazy loaded)
Export PDF:         ~90 KB (lazy loaded)
```

**Total Initial Load**: ~600 KB (gzipped)
**Full App (lazy loaded)**: ~900 KB (gzipped)

---

## 🔍 Development Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "e2e": "playwright test",
  "e2e:headed": "playwright test --headed"
}
```

---

## 🎯 Key Dependencies by Use Case

### Need to...

**Make API Calls?**
- Use: `axios` or `fetch`
- File: `src/services/api.ts`

**Manage Server State?**
- Use: `@tanstack/react-query`
- Hooks: `useQuery`, `useMutation`

**Navigate Between Pages?**
- Use: `react-router-dom`
- Hook: `useNavigate()`

**Show Notifications?**
- Use: `react-hot-toast`
- Function: `toast.success()`, `toast.error()`

**Animate Components?**
- Use: `framer-motion`
- Component: `<motion.div>`

**Validate Forms?**
- Use: `zod` + `@hookform/resolvers`
- Hook: `useForm()`

**Translate Text?**
- Use: `i18next` + `react-i18next`
- Hook: `useTranslation()`

**Create Charts?**
- Use: `recharts` or `chart.js`
- Components: `<LineChart>`, `<BarChart>`

**Export to PDF?**
- Use: `jspdf` + `html2canvas`
- File: `src/utils/pdfExport.ts`

**Export to Excel?**
- Use: `exceljs`
- File: `src/utils/exportUtils.js`

---

> **Modern, optimized stack with best-in-class tools for performance and developer experience**
