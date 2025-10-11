# ♿ Accessibility Guide

## Overview
This guide documents the accessibility features implemented in the Student Dashboard and provides guidelines for maintaining and improving accessibility.

## Current Accessibility Features

### ✅ Implemented

#### 1. Language & Direction
- ✅ HTML `lang="he"` attribute for Hebrew
- ✅ `dir="rtl"` for right-to-left layout
- ✅ Proper RTL CSS throughout

#### 2. ARIA Attributes
- ✅ `role="status"` on loading components
- ✅ `aria-busy="true"` during loading states
- ✅ `aria-live="polite"` for dynamic updates
- ✅ `role="alert"` on error messages
- ✅ `aria-label` on important buttons
- ✅ `aria-hidden="true"` on decorative elements

#### 3. Screen Reader Support
- ✅ `.sr-only` class for screen reader-only text
- ✅ Descriptive labels on all loading states
- ✅ Error messages readable by screen readers
- ✅ Proper heading hierarchy

#### 4. Keyboard Navigation
- ✅ All interactive elements keyboard accessible
- ✅ Try again/reload buttons in error boundaries
- ✅ Proper focus management
- ✅ No keyboard traps

#### 5. Semantic HTML
- ✅ Proper use of `<button>` for actions
- ✅ `<nav>` for navigation
- ✅ `<main>` for main content
- ✅ Heading hierarchy (h1, h2, h3)

#### 6. Visual Accessibility
- ✅ Loading spinners with sufficient size
- ✅ Clear visual feedback on interactions
- ✅ Skeleton loaders for content placeholders

## Accessibility Checklist

### Level A (Must Have) ✅
- [x] Text alternatives for non-text content
- [x] Keyboard accessible
- [x] Sufficient time to read/interact
- [x] No seizure-inducing content
- [x] Proper page structure
- [x] Descriptive page titles
- [x] Logical focus order
- [x] Link purpose clear from text
- [x] Language of page identified
- [x] Form labels or instructions

### Level AA (Should Have) 🔄
- [x] Captions for audio/video (N/A - no media)
- [x] Multiple ways to find pages
- [x] Headings and labels descriptive
- [x] Focus visible
- [x] Contrast ratio at least 4.5:1 (⚠️ needs audit)
- [x] Text can be resized 200%
- [ ] Images of text avoided (⚠️ check logo/icons)
- [x] Consistent navigation
- [x] Consistent identification

### Level AAA (Nice to Have) 📋
- [ ] Sign language for audio/video (N/A)
- [ ] Contrast ratio at least 7:1
- [ ] No background audio
- [ ] Unusual words explained
- [ ] Help available
- [ ] Error prevention for critical actions

## Testing Tools

### Automated Testing
```bash
# Install axe-core for testing
npm install -D @axe-core/react

# Add to your test setup
import { axe } from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}
```

### Manual Testing

#### 1. Keyboard Navigation Test
```
Test Sequence:
1. Navigate entire app using only Tab/Shift+Tab
2. Activate all controls with Enter/Space
3. Verify no keyboard traps
4. Check focus indicators are visible
```

#### 2. Screen Reader Test
```
Tools:
- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (Mac, built-in)
- TalkBack (Android, built-in)

Test:
1. Navigate app with screen reader
2. Verify all content is announced
3. Check form labels are read
4. Verify error messages are announced
```

#### 3. Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Visual feedback about accessibility
- **Lighthouse**: Built into Chrome DevTools

## Common Issues & Fixes

### Issue 1: Missing Alt Text
```jsx
// ❌ Bad
<img src="/logo.png" />

// ✅ Good
<img src="/logo.png" alt="Student Dashboard Logo" />

// ✅ Decorative (no alt needed)
<img src="/decorative.png" alt="" aria-hidden="true" />
```

### Issue 2: Missing Form Labels
```jsx
// ❌ Bad
<input type="text" placeholder="שם התלמיד" />

// ✅ Good
<label htmlFor="student-name">שם התלמיד</label>
<input id="student-name" type="text" />

// ✅ Also Good (implicit label)
<label>
  שם התלמיד
  <input type="text" />
</label>
```

### Issue 3: Non-Semantic Buttons
```jsx
// ❌ Bad
<div onClick={handleClick}>לחץ כאן</div>

// ✅ Good
<button onClick={handleClick}>לחץ כאן</button>

// ✅ If must use div
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  לחץ כאן
</div>
```

### Issue 4: Missing Focus Indicators
```css
/* ❌ Bad - removing focus outline */
button:focus {
  outline: none;
}

/* ✅ Good - custom focus style */
button:focus-visible {
  outline: 2px solid #4285f4;
  outline-offset: 2px;
}
```

### Issue 5: Low Contrast
```css
/* ❌ Bad - insufficient contrast */
.text {
  color: #999999; /* On white background = 2.85:1 */
}

/* ✅ Good - WCAG AA compliant */
.text {
  color: #595959; /* On white background = 4.54:1 */
}
```

## Color Contrast Guidelines

### WCAG AA (Required)
- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum
- **UI components**: 3:1 minimum

### WCAG AAA (Recommended)
- **Normal text**: 7:1 minimum
- **Large text**: 4.5:1 minimum

### Tools to Check
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Elements > Accessibility pane
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

## Accessibility Testing Script

Add this to your CI/CD:

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build

      # Run axe accessibility tests
      - name: Run axe tests
        run: |
          npx serve dist -l 3000 &
          npx wait-on http://localhost:3000
          npx @axe-core/cli http://localhost:3000 --exit
```

## RTL Accessibility Considerations

### Text Direction
```html
<!-- ✅ Correct -->
<html lang="he" dir="rtl">

<!-- Icons should flip in RTL -->
<span className="icon-chevron-left" aria-hidden="true">→</span>
```

### Logical Properties
```css
/* ✅ Use logical properties for RTL compatibility */
.card {
  margin-inline-start: 1rem;  /* Not margin-left */
  padding-inline-end: 2rem;    /* Not padding-right */
}
```

## Future Improvements

### High Priority
- [ ] Run full Lighthouse accessibility audit
- [ ] Fix any contrast issues found
- [ ] Add skip navigation links
- [ ] Implement focus trap for modals
- [ ] Add ARIA live regions for notifications

### Medium Priority
- [ ] Add keyboard shortcuts documentation
- [ ] Implement roving tabindex for complex components
- [ ] Add aria-describedby for form errors
- [ ] Test with real screen reader users
- [ ] Add reduced motion preference support

### Low Priority
- [ ] High contrast mode support
- [ ] Voice control testing
- [ ] International accessibility standards (beyond WCAG)

## Resources

### Standards & Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Learning Resources
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

**Last Updated**: 2025-01-09
**WCAG Level**: Aiming for AA compliance
**Next Audit**: After implementing remaining improvements
