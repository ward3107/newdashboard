# ADR 004: Progressive Web App (PWA) Implementation

## Status
Accepted

## Context
The application needed offline capabilities and the ability to be installed on devices for a native app-like experience, especially useful for teachers accessing student data in areas with poor connectivity.

## Decision
We implemented PWA functionality using **vite-plugin-pwa** with Workbox for service worker generation.

### Implementation Details
- **Auto-update strategy**: Service worker automatically updates
- **Manifest**: Complete web app manifest with RTL support
- **Icons**: SVG icons for flexibility
- **Caching Strategy**:
  - App shell: Precached on install
  - Google Apps Script API: NetworkFirst with 1-hour cache
  - Static assets: Cached with versioning

### Manifest Configuration
```json
{
  "name": "מערכת ניתוח תלמידים - AI Student Dashboard",
  "short_name": "Student Dashboard",
  "lang": "he",
  "dir": "rtl",
  "display": "standalone",
  "theme_color": "#4285f4",
  "background_color": "#ffffff"
}
```

### Caching Strategies
1. **App Shell (Precache)**: HTML, CSS, JS, fonts
2. **API Calls (NetworkFirst)**: Try network, fall back to cache
3. **Runtime Cache**: 10 entries max, 1-hour expiration

## Consequences

### Positive
- **Offline Support**: App shell loads offline after first visit
- **Installable**: Can be installed on home screen
- **Performance**: Cached assets load instantly
- **Native Feel**: Standalone display mode
- **Reliability**: Works in poor network conditions
- **SEO**: PWA is a ranking signal

### Negative
- **Storage**: Uses device storage for caches
- **Complexity**: Service worker lifecycle to understand
- **Cache Invalidation**: Must handle cache updates properly
- **Testing**: Requires HTTPS or localhost to test

## Configuration Files
- `vite.config.js`: PWA plugin configuration
- Auto-generated: `manifest.webmanifest`, `sw.js`

## Workbox Configuration
```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/script\.google\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'google-api-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 3600 }
      }
    }
  ]
}
```

## Alternatives Considered
1. **Manual Service Worker**: Rejected - too complex, error-prone
2. **Workbox CLI**: Rejected - vite-plugin-pwa integrates better
3. **No PWA**: Rejected - offline support is valuable for teachers

## Lighthouse PWA Checklist
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Has a <meta name="viewport"> tag

## Testing PWA
```bash
# Build the app
npm run build

# Serve with PWA
npm run preview

# Check in Chrome DevTools > Application tab
# - Manifest
# - Service Workers
# - Cache Storage
```

## Future Enhancements
- [ ] Background sync for offline form submissions
- [ ] Push notifications for important updates
- [ ] Periodic background sync
- [ ] Better offline UI/UX
- [ ] Share Target API integration

## References
- [vite-plugin-pwa Documentation](https://vite-plugin-pwa.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)
