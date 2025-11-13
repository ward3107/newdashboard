# 🎨 Marketing Page - Notion TODO Checklist

Copy this into Notion as a Database with checkboxes!

---

## 🔴 Critical Priority (Do First)

### Task 1: Fix Network Errors
- [ ] Fix empty iframe src (line 3221 in landing.html) - change `src=""` to `src="about:blank"`
- [ ] Test in DevTools Network tab - confirm no errors
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- **Priority**: 🔴 Critical
- **Time**: 5 minutes
- **Files**: `/public/landing.html`

### Task 2: Fix Scroll Behavior
- [ ] Check current scroll-padding-top value
- [ ] Measure actual header height (currently ~80px)
- [ ] Adjust scroll-margin-top to show section headings properly
- [ ] Test clicking all navigation links
- [ ] Verify user sees full section heading after scroll
- **Priority**: 🔴 Critical
- **Time**: 15 minutes
- **Files**: `/public/landing.html` (CSS section)

### Task 3: Add Language Switcher UI
- [ ] Design language switcher component (flags + text)
- [ ] Add to navigation bar (top right corner)
- [ ] Style for desktop (horizontal flags)
- [ ] Style for mobile (dropdown menu)
- [ ] Add hover effects and animations
- **Priority**: 🔴 Critical
- **Time**: 1 hour
- **Files**: `/public/landing.html` (lines 2900-2950)

---

## 🟠 High Priority

### Task 4: Create Translation Structure
- [ ] Create JavaScript translation object structure
- [ ] Add data-i18n attributes to all translatable elements
- [ ] Create language switching function
- [ ] Store language preference in localStorage
- [ ] Switch RTL/LTR based on language (Hebrew/Arabic = RTL, English/Russian = LTR)
- **Priority**: 🟠 High
- **Time**: 2 hours
- **Files**: `/public/landing.html` (JavaScript section)

### Task 5: Translate Meta Tags & SEO
- [ ] Translate page title to EN/AR/RU
- [ ] Translate meta description to EN/AR/RU
- [ ] Translate meta keywords to EN/AR/RU
- [ ] Add Open Graph tags (og:title, og:description, og:image)
- [ ] Add Twitter Card tags
- [ ] Test with social media preview tools
- **Priority**: 🟠 High
- **Time**: 1 hour
- **Files**: `/public/landing.html` (lines 1-50)

### Task 6: Translate Navigation Menu
- [ ] הבעיה → The Problem → المشكلة → Проблема
- [ ] תכונות → Features → الميزات → Функции
- [ ] סרטון הדגמה → Video Demo → فيديو توضيحي → Видео демо
- [ ] המהפכה → Revolution → الثورة → Революция
- [ ] חישוב ROI → ROI Calculator → حاسبة العائد → ROI Калькулятор
- [ ] שאלות נפוצות → FAQ → الأسئلة الشائعة → FAQ
- [ ] מחירים → Pricing → الأسعار → Цены
- [ ] צור קשר → Contact → اتصل بنا → Контакт
- **Priority**: 🟠 High
- **Time**: 30 minutes
- **Files**: `/public/landing.html` (navigation section)

### Task 7: Translate Hero Section
- [ ] Main headline translation (4 languages)
- [ ] Subheadline translation (4 languages)
- [ ] Primary CTA button text (4 languages)
- [ ] Secondary CTA button text (4 languages)
- **Priority**: 🟠 High
- **Time**: 1 hour
- **Files**: `/public/landing.html` (hero section)

### Task 8: Translate Feature Cards (9 cards)
- [ ] Feature 1: AI Analysis translation
- [ ] Feature 2: Classroom Optimization translation
- [ ] Feature 3: Behavioral Tracking translation
- [ ] Feature 4: Report Generation translation
- [ ] Feature 5: Integration translation
- [ ] Feature 6: Security & Privacy translation
- [ ] Feature 7: Mobile Access translation
- [ ] Feature 8: Customization translation
- [ ] Feature 9: Support translation
- **Priority**: 🟠 High
- **Time**: 3 hours
- **Files**: `/public/landing.html` (features section)

---

## 🟡 Medium Priority

### Task 9: Translate ROI Calculator
- [ ] Form field labels (students count, hours per week, etc.)
- [ ] Calculation result text
- [ ] Savings explanations
- [ ] CTA button in calculator
- **Priority**: 🟡 Medium
- **Time**: 1.5 hours
- **Files**: `/public/landing.html` (ROI section)

### Task 10: Translate FAQ Section (6 Q&A)
- [ ] Question 1: What is ISHEBOT? (translation)
- [ ] Answer 1: (translation)
- [ ] Question 2: How does AI work? (translation)
- [ ] Answer 2: (translation)
- [ ] Question 3: Is data secure? (translation)
- [ ] Answer 3: (translation)
- [ ] Question 4: Pricing plans? (translation)
- [ ] Answer 4: (translation)
- [ ] Question 5: Integration? (translation)
- [ ] Answer 5: (translation)
- [ ] Question 6: Support? (translation)
- [ ] Answer 6: (translation)
- **Priority**: 🟡 Medium
- **Time**: 2 hours
- **Files**: `/public/landing.html` (FAQ section)

### Task 11: Translate Pricing Section
- [ ] Plan names (Free, Professional, Enterprise)
- [ ] Plan features lists
- [ ] Pricing details
- [ ] CTA buttons for each plan
- **Priority**: 🟡 Medium
- **Time**: 1.5 hours
- **Files**: `/public/landing.html` (pricing section)

### Task 12: Translate Contact Form
- [ ] Form labels (Name, Email, Phone, Message)
- [ ] Placeholder text
- [ ] Submit button text
- [ ] Success message
- [ ] Error messages
- **Priority**: 🟡 Medium
- **Time**: 1 hour
- **Files**: `/public/landing.html` (contact section)

### Task 13: Translate Footer
- [ ] Footer menu links
- [ ] Footer sections headings
- [ ] Social media labels
- [ ] Copyright text
- **Priority**: 🟡 Medium
- **Time**: 30 minutes
- **Files**: `/public/landing.html` (footer section)

### Task 14: Fix WhatsApp Contact Number
- [ ] Get real WhatsApp business number
- [ ] Replace placeholder `972XXXXXXXXX` with real number
- [ ] Update in floating WhatsApp button (line 3723)
- [ ] Update in footer WhatsApp link (line 3800)
- [ ] Test WhatsApp link opens correctly
- **Priority**: 🟡 Medium
- **Time**: 5 minutes
- **Files**: `/public/landing.html`

### Task 15: Add YouTube Demo Video
- [ ] Record or prepare demo video
- [ ] Upload to YouTube
- [ ] Get embed URL
- [ ] Add to iframe src (line 3221)
- [ ] Test video loads and plays correctly
- **Priority**: 🟡 Medium
- **Time**: 2 hours (including video creation)
- **Files**: `/public/landing.html`

### Task 16: Verify Social Media Links
- [ ] Create/verify Instagram account (@ishebot)
- [ ] Create/verify Facebook page (/ishebot)
- [ ] Create/verify TikTok account (@ishebot)
- [ ] Create/verify LinkedIn page (/company/ishebot)
- [ ] Create/verify YouTube channel (@ishebot)
- [ ] Create/verify Twitter/X account (@ishebot)
- [ ] Update all links in footer (lines 3782-3800)
- [ ] Test all links open correctly
- **Priority**: 🟡 Medium
- **Time**: 3 hours (account creation + setup)
- **Files**: `/public/landing.html`

---

## 🟢 Low Priority (Optimization)

### Task 17: Optimize Page Performance
- [ ] Extract inline CSS to external file (styles.css)
- [ ] Extract inline JavaScript to external file (scripts.js)
- [ ] Minify CSS
- [ ] Minify JavaScript
- [ ] Compress HTML
- [ ] Optimize images (if any)
- [ ] Test page load speed (target: < 2 seconds)
- [ ] Measure size reduction (target: 235 KB → 80 KB)
- **Priority**: 🟢 Low
- **Time**: 3 hours
- **Files**: `/public/landing.html`, new files `styles.css`, `scripts.js`

### Task 18: Create Privacy Policy Page
- [ ] Draft privacy policy content (GDPR compliant)
- [ ] Create `/public/privacy-policy.html`
- [ ] Translate to all 4 languages
- [ ] Link from footer
- [ ] Add cookie consent banner if needed
- **Priority**: 🟢 Low
- **Time**: 4 hours
- **Files**: New file `/public/privacy-policy.html`

### Task 19: Create Terms of Service Page
- [ ] Draft terms of service content
- [ ] Create `/public/terms.html`
- [ ] Translate to all 4 languages
- [ ] Link from footer
- [ ] Legal review recommended
- **Priority**: 🟢 Low
- **Time**: 4 hours
- **Files**: New file `/public/terms.html`

### Task 20: Create Security / Tikkun 13 Page
- [ ] Document security measures
- [ ] Explain Tikkun 13 compliance
- [ ] Create `/public/security.html`
- [ ] Translate to all 4 languages
- [ ] Link from footer
- **Priority**: 🟢 Low
- **Time**: 3 hours
- **Files**: New file `/public/security.html`

### Task 21: Add Structured Data (Schema.org)
- [ ] Add SoftwareApplication schema
- [ ] Add Organization schema
- [ ] Add Offer schema for pricing
- [ ] Add FAQ schema
- [ ] Test with Google Rich Results Test
- **Priority**: 🟢 Low
- **Time**: 2 hours
- **Files**: `/public/landing.html` (head section)

### Task 22: Mobile Responsiveness Audit
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test navigation hamburger menu
- [ ] Test hero section layout
- [ ] Test feature cards stacking
- [ ] Test ROI calculator mobile view
- [ ] Test contact form mobile layout
- [ ] Fix any layout issues found
- **Priority**: 🟢 Low
- **Time**: 3 hours
- **Files**: `/public/landing.html` (CSS media queries)

### Task 23: Accessibility (A11y) Improvements
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure sufficient color contrast (WCAG AA)
- [ ] Add keyboard navigation support
- [ ] Add focus indicators
- [ ] Add alt text to all images/icons
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Run Lighthouse accessibility audit (target: score > 90)
- **Priority**: 🟢 Low
- **Time**: 4 hours
- **Files**: `/public/landing.html`

### Task 24: A/B Testing Setup
- [ ] Choose A/B testing tool (Google Optimize, VWO, etc.)
- [ ] Set up conversion tracking
- [ ] Create test variants
- [ ] Define success metrics
- [ ] Run tests for 2-4 weeks
- **Priority**: 🟢 Low
- **Time**: 5 hours
- **Files**: `/public/landing.html`

---

## 📊 Summary

| Priority | Tasks | Est. Time |
|----------|-------|-----------|
| 🔴 Critical | 3 | 1.5 hours |
| 🟠 High | 6 | 8.5 hours |
| 🟡 Medium | 10 | 14 hours |
| 🟢 Low | 8 | 28 hours |
| **TOTAL** | **27** | **52 hours** |

---

## 🎯 Recommended Sprint Plan

### Week 1: Critical + High (10 hours)
- Fix all errors
- Add language switcher
- Complete translations structure
- Translate navigation, hero, features

### Week 2: Medium Priority (14 hours)
- Translate ROI, FAQ, pricing, contact, footer
- Fix WhatsApp number
- Add YouTube video
- Setup social media links

### Week 3: Low Priority Optimization (28 hours)
- Performance optimization
- Create missing pages (privacy, terms, security)
- Mobile responsiveness
- Accessibility improvements
- SEO enhancements

---

## ✅ Acceptance Criteria

### Phase 1: Errors Fixed
- [ ] Zero network errors in DevTools
- [ ] All navigation links scroll correctly
- [ ] User sees full section headings after click

### Phase 2: Translations Complete
- [ ] Language switcher visible and functional
- [ ] All content translated to 4 languages (HE/EN/AR/RU)
- [ ] RTL/LTR switching works
- [ ] Language preference persists in localStorage

### Phase 3: Optimization Complete
- [ ] Page size reduced by 60%+
- [ ] Lighthouse performance score > 90
- [ ] Lighthouse accessibility score > 90
- [ ] All missing pages created
- [ ] Mobile responsive on all devices
- [ ] SEO tags complete

---

## 📝 Notes for Implementation

- Use data-i18n attributes for easy translation mapping
- Consider using i18next.js for translation management (same as React app)
- Test all languages on both desktop and mobile
- Ensure Arabic and Hebrew maintain proper RTL layout
- Keep translation keys consistent between marketing page and React app
- Consider merging landing page into React app for unified i18n system

---

## 🔗 Related Documents

- `/docs/MARKETING_PAGE_ANALYSIS.md` - Detailed technical analysis
- `/docs/notion-export/05-TECH-STACK-AND-ROUTING.md` - Current tech stack
- `/docs/TODO-PRIORITY-LIST.md` - Platform-wide TODO list

---

**Ready to import into Notion!** 📋

Create a new Notion Database with these properties:
- **Task Name** (Title)
- **Status** (Checkbox)
- **Priority** (Select: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low)
- **Time Estimate** (Text)
- **Files** (Text)
- **Category** (Select: Fixes, Translations, Optimization, Pages)
