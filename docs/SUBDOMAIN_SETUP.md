# Subdomain Setup Guide

**How to create dynamic subdomains for each school (einstein.ishebot.com, herzl.ishebot.com, etc.)**

---

## 🎯 Overview

There are **3 different approaches** to implement subdomains for multi-tenant SaaS:

1. **Wildcard DNS + Vercel** (RECOMMENDED - Easiest, Free)
2. **Cloudflare Workers + DNS** (Advanced, More Control)
3. **Manual DNS Records** (Not scalable - DON'T USE)

---

## ✅ Option 1: Wildcard DNS + Vercel (RECOMMENDED)

This is the **easiest and most common** approach for SaaS platforms.

### How It Works

```
*.ishebot.com  →  Vercel App
   ↓
einstein.ishebot.com  →  Vercel detects "einstein"  →  Shows Einstein's data
herzl.ishebot.com     →  Vercel detects "herzl"     →  Shows Herzl's data
rothschild.ishebot.com → Vercel detects "rothschild" → Shows Rothschild's data
```

**Key Point:** You don't create individual DNS records for each school. One wildcard DNS record handles ALL subdomains!

---

## 📋 Step-by-Step Setup (Vercel + Wildcard DNS)

### Step 1: Purchase Domain

**Where to buy:**
- Namecheap: https://www.namecheap.com (~$12/year)
- Google Domains: https://domains.google.com (~$12/year)
- Cloudflare Registrar: https://www.cloudflare.com/products/registrar/ (~$8/year, cheapest)

**Recommended domain:** `ishebot.com` or `ishebot.co.il`

**Cost:** ~$10-15/year

---

### Step 2: Configure DNS (Wildcard Record)

Once you own `ishebot.com`, go to your DNS provider (where you bought the domain):

#### If using Namecheap:

1. Log in to Namecheap
2. Go to "Domain List" → Click "Manage" next to your domain
3. Click "Advanced DNS" tab
4. Add these DNS records:

```
Type       Host              Value                      TTL
---------------------------------------------------------------
A Record   @                 76.76.21.21                Automatic
A Record   www               76.76.21.21                Automatic
CNAME      *                 cname.vercel-dns.com       Automatic
```

**Explanation:**
- `@` → Points `ishebot.com` to Vercel
- `www` → Points `www.ishebot.com` to Vercel
- `*` → **Wildcard!** Points ALL subdomains (`*.ishebot.com`) to Vercel

#### If using Cloudflare:

1. Log in to Cloudflare
2. Select your domain
3. Go to "DNS" → "Records"
4. Add these records:

```
Type       Name              Content                    Proxy Status
-----------------------------------------------------------------------
A          @                 76.76.21.21                DNS only (gray cloud)
A          www               76.76.21.21                DNS only (gray cloud)
CNAME      *                 cname.vercel-dns.com       DNS only (gray cloud)
```

**IMPORTANT:** Turn OFF the orange cloud (proxy) for the wildcard record!

#### If using Google Domains:

1. Log in to Google Domains
2. Click on your domain
3. Go to "DNS" section
4. Add these records:

```
Type       Host              Data
------------------------------------------------
A          @                 76.76.21.21
A          www               76.76.21.21
CNAME      *                 cname.vercel-dns.com
```

---

### Step 3: Configure Vercel Project

#### 3a. Deploy Your App to Vercel

```bash
# In your project directory
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new? Create new
# - What's your project name? ishebot
# - In which directory is your code? ./
# - Override settings? No
```

Your app is now live at: `https://ishebot.vercel.app`

#### 3b. Add Custom Domain to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project (`ishebot`)
3. Go to "Settings" → "Domains"
4. Add these domains:

```
Domain to add:
1. ishebot.com
2. www.ishebot.com
3. *.ishebot.com  ← WILDCARD - This is the key!
```

**For each domain:**
- Click "Add"
- Vercel will show you DNS instructions
- If you configured DNS correctly in Step 2, it should verify automatically
- Wait 5-10 minutes for DNS propagation

#### 3c. Verify Wildcard Domain

After adding `*.ishebot.com`:

1. Vercel will show verification status
2. It should say "Valid Configuration" after a few minutes
3. Test by visiting any subdomain:
   - https://test.ishebot.com
   - https://demo.ishebot.com
   - https://anything.ishebot.com

**All should load your app!**

---

### Step 4: Update vercel.json Configuration

Create or update `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### Step 5: Frontend - Detect Subdomain

Update your React app to detect which subdomain is being accessed:

```typescript
// src/utils/subdomain.ts

/**
 * Extract subdomain from current URL
 * Returns null for main domain or www
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Development (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For local testing, you can use:
    // localhost:5173?tenant=einstein
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant');
  }

  // Production
  const parts = hostname.split('.');

  // If domain is ishebot.com or www.ishebot.com → no subdomain
  if (parts.length <= 2 || parts[0] === 'www') {
    return null;
  }

  // If domain is einstein.ishebot.com → subdomain is "einstein"
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Check if current subdomain is reserved (system subdomains)
 */
export function isReservedSubdomain(subdomain: string): boolean {
  const reserved = [
    'www',
    'app',
    'admin',
    'api',
    'dashboard',
    'demo',
    'test',
    'staging',
    'dev',
    'docs',
    'blog',
    'help',
    'support',
    'mail',
    'email'
  ];

  return reserved.includes(subdomain.toLowerCase());
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be 3-63 characters
  if (subdomain.length < 3 || subdomain.length > 63) {
    return false;
  }

  // Must contain only lowercase letters, numbers, and hyphens
  const regex = /^[a-z0-9-]+$/;
  if (!regex.test(subdomain)) {
    return false;
  }

  // Cannot start or end with hyphen
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return false;
  }

  // Cannot be reserved
  if (isReservedSubdomain(subdomain)) {
    return false;
  }

  return true;
}

/**
 * Build full subdomain URL
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  const domain = import.meta.env.VITE_DOMAIN || 'ishebot.com';
  const protocol = import.meta.env.PROD ? 'https' : 'http';

  return `${protocol}://${subdomain}.${domain}${path}`;
}
```

---

### Step 6: Update useTenant Hook

Update your `useTenant` hook to use subdomain detection:

```typescript
// src/hooks/useTenant.ts

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getSubdomain } from '../utils/subdomain';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'pending' | 'trial' | 'active' | 'suspended' | 'expired';
  plan: 'free' | 'basic' | 'premium';
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    schoolName?: string;
  };
  maxStudents: number;
  trialEndsAt?: Date;
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectTenant = async () => {
      try {
        // 1. Get subdomain from URL
        const subdomain = getSubdomain();

        // 2. No subdomain → Show marketing site or redirect
        if (!subdomain) {
          setTenant(null);
          setLoading(false);
          return;
        }

        // 3. Special case: admin portal
        if (subdomain === 'admin') {
          setTenant({ type: 'admin' } as any);
          setLoading(false);
          return;
        }

        // 4. Query Firestore for tenant by subdomain
        const tenantQuery = query(
          collection(db, 'tenants'),
          where('subdomain', '==', subdomain)
        );

        const snapshot = await getDocs(tenantQuery);

        // 5. Tenant not found
        if (snapshot.empty) {
          setError('School not found. Please check the URL.');
          setLoading(false);
          return;
        }

        // 6. Load tenant data
        const tenantDoc = snapshot.docs[0];
        const tenantData = tenantDoc.data();

        setTenant({
          id: tenantDoc.id,
          ...tenantData,
          trialEndsAt: tenantData.trialEndsAt?.toDate()
        } as Tenant);

        setLoading(false);

      } catch (err) {
        console.error('Error detecting tenant:', err);
        setError('Failed to load school data. Please try again.');
        setLoading(false);
      }
    };

    detectTenant();
  }, []);

  return {
    tenant,
    loading,
    error,
    subdomain: getSubdomain(),
    isActive: tenant?.status === 'active' || tenant?.status === 'trial'
  };
}
```

---

### Step 7: Update App.tsx

Use the tenant in your main App component:

```typescript
// src/App.tsx

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from './hooks/useTenant';
import { useAuth } from './hooks/useAuth';

export function App() {
  const { tenant, loading, error, subdomain, isActive } = useTenant();
  const { user, userData } = useAuth();

  // Apply custom branding
  useEffect(() => {
    if (tenant?.customBranding) {
      // Set CSS variables for theming
      document.documentElement.style.setProperty(
        '--primary-color',
        tenant.customBranding.primaryColor || '#4F46E5'
      );

      document.documentElement.style.setProperty(
        '--secondary-color',
        tenant.customBranding.secondaryColor || '#10B981'
      );

      // Set page title
      document.title = tenant.customBranding.schoolName || tenant.name || 'ISHEBOT';

      // Set favicon
      if (tenant.customBranding.logo) {
        const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (favicon) {
          favicon.href = tenant.customBranding.logo;
        }
      }
    }
  }, [tenant]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">School Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              Subdomain: <strong>{subdomain || 'none'}</strong>
            </p>
            <a
              href="https://ishebot.com"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // No subdomain → Marketing site
  if (!subdomain) {
    return <MarketingSite />;
  }

  // Admin portal
  if (tenant?.type === 'admin') {
    return <SuperAdminPortal />;
  }

  // Account not active
  if (!isActive) {
    if (tenant?.status === 'suspended') {
      return <PaymentFailedScreen tenant={tenant} />;
    }
    if (tenant?.status === 'expired') {
      return <TrialExpiredScreen tenant={tenant} />;
    }
    if (tenant?.status === 'pending') {
      return <EmailVerificationScreen tenant={tenant} />;
    }
  }

  // User not authenticated
  if (!user) {
    return <LoginPage tenant={tenant} />;
  }

  // User doesn't belong to this tenant
  if (userData && userData.tenantId !== tenant?.id && userData.role !== 'super-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-yellow-500 text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have access to this school's portal.
            </p>
            <button
              onClick={() => auth.signOut()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All good → Show app
  return (
    <TenantContext.Provider value={tenant}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/billing" element={<BillingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TenantContext.Provider>
  );
}

function MarketingSite() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to ISHEBOT
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered student analysis platform for schools
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-semibold"
          >
            Start Free Trial
          </a>
          <a
            href="/demo"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 text-lg font-semibold"
          >
            View Demo
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 8: Environment Variables

Update your `.env.local`:

```bash
# Production domain
VITE_DOMAIN=ishebot.com

# Firebase config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... rest of Firebase config

# For local development with subdomains
# Access via: http://localhost:5173?tenant=einstein
```

---

### Step 9: Local Development with Subdomains

For local testing of subdomains, you have 2 options:

#### Option A: Query Parameter (Easiest)

```
http://localhost:5173?tenant=einstein
http://localhost:5173?tenant=herzl
```

Update `getSubdomain()` to check for query param (already done in Step 5).

#### Option B: /etc/hosts File (More Realistic)

**On Mac/Linux:**

1. Edit `/etc/hosts`:
```bash
sudo nano /etc/hosts
```

2. Add these lines:
```
127.0.0.1  einstein.localhost
127.0.0.1  herzl.localhost
127.0.0.1  rothschild.localhost
```

3. Access via:
```
http://einstein.localhost:5173
http://herzl.localhost:5173
```

**On Windows:**

1. Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator)
2. Add same lines as above
3. Access same URLs

---

## 🎨 Complete Example Flow

### User Journey:

```
1. School signs up → Chooses subdomain "einstein"
   Backend creates tenant with subdomain: "einstein"

2. Vercel wildcard DNS is already configured: *.ishebot.com

3. User visits: https://einstein.ishebot.com
   ↓
   Vercel receives request
   ↓
   React app loads
   ↓
   getSubdomain() extracts "einstein"
   ↓
   useTenant() queries Firestore: WHERE subdomain == "einstein"
   ↓
   Loads tenant data for Einstein High School
   ↓
   Shows Einstein's dashboard with their branding
```

---

## 🔧 Testing Your Setup

### Test 1: DNS Propagation

```bash
# Check if wildcard DNS is working
nslookup test.ishebot.com

# Should resolve to Vercel's IP
# If it doesn't work, wait 5-10 minutes for DNS propagation
```

### Test 2: SSL Certificate

```bash
# Visit any subdomain
https://anything.ishebot.com

# Should show:
# - Valid SSL certificate (green padlock)
# - Your React app loads
# - No certificate errors
```

### Test 3: Subdomain Detection

```javascript
// In browser console on einstein.ishebot.com
console.log(window.location.hostname);  // "einstein.ishebot.com"
console.log(window.location.hostname.split('.')[0]);  // "einstein"
```

### Test 4: Different Subdomains

Visit these URLs and confirm each shows correct data:

```
https://einstein.ishebot.com  → Shows Einstein High School
https://herzl.ishebot.com     → Shows Herzl Middle School
https://test.ishebot.com      → Shows "School not found" (if not in Firestore)
```

---

## 💰 Cost Breakdown

### One-time:
- **Domain registration:** $10-15/year

### Monthly:
- **Vercel hosting:** $0 (free tier includes custom domains + SSL)
- **DNS hosting:** $0 (included with domain purchase)
- **Wildcard SSL:** $0 (Vercel provides free SSL for wildcards)

**Total pilot cost: ~$12/year**

**No per-subdomain cost!** You can have unlimited subdomains for free.

---

## 🚨 Common Issues & Solutions

### Issue 1: "DNS Not Configured"

**Problem:** Vercel shows "Invalid Configuration" for `*.ishebot.com`

**Solution:**
- Wait 10-30 minutes for DNS propagation
- Check DNS records are correct
- Make sure CNAME points to `cname.vercel-dns.com` (not an IP)
- Turn OFF Cloudflare proxy (orange cloud) if using Cloudflare

### Issue 2: SSL Certificate Error

**Problem:** Browser shows "Not Secure" warning

**Solution:**
- Vercel auto-generates SSL for wildcards
- Wait 5-10 minutes after adding domain
- Check that domain is "Valid" in Vercel dashboard
- Clear browser cache

### Issue 3: Wrong School Data Showing

**Problem:** einstein.ishebot.com shows herzl's data

**Solution:**
- Check `getSubdomain()` is correctly extracting subdomain
- Check Firestore query: `where('subdomain', '==', subdomain)`
- Check tenant data has correct subdomain field
- Clear browser cache and local storage

### Issue 4: Can't Access Subdomain Locally

**Problem:** einstein.localhost:5173 doesn't work

**Solution:**
- Use query param instead: `localhost:5173?tenant=einstein`
- Or check `/etc/hosts` file is configured correctly
- Restart browser after editing hosts file

---

## 🔐 Security Considerations

### 1. Subdomain Validation (Backend)

Always validate subdomain format when creating account:

```typescript
// In createSchoolAccount function
function isValidSubdomain(subdomain: string): boolean {
  // Length check
  if (subdomain.length < 3 || subdomain.length > 63) return false;

  // Format check
  if (!/^[a-z0-9-]+$/.test(subdomain)) return false;

  // Reserved check
  const reserved = ['www', 'app', 'admin', 'api', 'test'];
  if (reserved.includes(subdomain)) return false;

  return true;
}
```

### 2. Tenant Isolation (Security Rules)

Always check tenant in security rules:

```javascript
// Firestore rules
match /students/{studentId} {
  allow read: if request.auth != null &&
                 request.auth.token.tenantId == resource.data.tenantId;
}
```

### 3. CORS Headers

Ensure CORS doesn't break with subdomains:

```json
// vercel.json
{
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://*.ishebot.com"
        }
      ]
    }
  ]
}
```

---

## 📚 Alternative: No Custom Domain (Use Vercel Subdomains)

If you don't want to buy a domain yet:

### Option: Use Vercel's Built-in Domains

Each deployment gets:
```
https://ishebot.vercel.app           (main)
https://ishebot-git-main.vercel.app  (git branch)
https://ishebot-abc123.vercel.app    (deployment)
```

**BUT:** You can't have wildcard subdomains on `.vercel.app` domains.

**Workaround:** Use path-based routing instead:

```
https://ishebot.vercel.app/einstein
https://ishebot.vercel.app/herzl
https://ishebot.vercel.app/rothschild
```

**Not recommended for production** - subdomains are more professional.

---

## ✅ Quick Start Checklist

- [ ] Purchase domain (e.g., ishebot.com)
- [ ] Configure wildcard DNS: `* → cname.vercel-dns.com`
- [ ] Deploy app to Vercel
- [ ] Add domain to Vercel: `*.ishebot.com`
- [ ] Wait 10 minutes for DNS propagation
- [ ] Test: visit `test.ishebot.com` - should load your app
- [ ] Implement `getSubdomain()` utility
- [ ] Update `useTenant()` hook
- [ ] Test with real tenant data
- [ ] Celebrate! 🎉

---

## 🎯 Summary

### How Subdomains Work:

1. **Buy domain:** ishebot.com (~$12/year)
2. **Add wildcard DNS:** `*.ishebot.com → Vercel`
3. **One-time setup** → Works for ALL subdomains forever
4. **No manual work** per school - automatic!
5. **Free SSL** for all subdomains
6. **Unlimited subdomains** - no extra cost

### When School Signs Up:

```
School chooses "einstein"
  ↓
Backend saves: { subdomain: "einstein" }
  ↓
DNS already configured (wildcard)
  ↓
einstein.ishebot.com works immediately!
  ↓
No additional DNS/Vercel configuration needed
```

**That's it! One wildcard DNS record handles infinite schools.** 🚀

---

## 📖 Additional Resources

### Documentation References
- **Multi-Tenant Architecture:** See `MULTI_TENANT_ARCHITECTURE.md` for complete system design
- **Onboarding Flow:** See `ONBOARDING_FLOW.md` for school signup process
- **Project Status:** See `PROJECT_STATUS.md` for current implementation status

### External Resources
- Vercel Wildcard Domains: https://vercel.com/docs/concepts/projects/domains#wildcard-domains
- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/rules-structure
- DNS Configuration Guide: https://www.cloudflare.com/learning/dns/dns-records/dns-cname-record/

---

## 🎓 Key Concepts Explained

### What is a Wildcard DNS?
A wildcard DNS record uses an asterisk (`*`) to match ALL subdomains automatically. Instead of creating:
- `einstein.ishebot.com → Vercel`
- `herzl.ishebot.com → Vercel`
- `rothschild.ishebot.com → Vercel`

You create ONE record:
- `*.ishebot.com → Vercel`

And it handles ALL subdomains automatically!

### Why Subdomains Instead of Paths?
Subdomains (`einstein.ishebot.com`) are better than paths (`ishebot.com/einstein`) because:
1. **More professional** - Each school feels like they have their own site
2. **Better branding** - Each subdomain can have custom branding
3. **Easier isolation** - Security and data separation is clearer
4. **Better SEO** - Each subdomain is treated as a separate site
5. **Custom SSL** - Each gets its own SSL certificate automatically

### How Does Detection Work?
```javascript
// User visits: https://einstein.ishebot.com
const hostname = window.location.hostname; // "einstein.ishebot.com"
const parts = hostname.split('.'); // ["einstein", "ishebot", "com"]
const subdomain = parts[0]; // "einstein"

// Query database for this subdomain
const tenant = await getTenant(subdomain);
// Returns Einstein High School's data
```

---

## 🚀 Next Steps After Setup

Once subdomains are working:

1. **Test thoroughly** - Try multiple subdomains, check data isolation
2. **Set up monitoring** - Track which subdomains are accessed
3. **Configure analytics** - Segment analytics by subdomain/tenant
4. **Add custom domains** (optional) - Allow schools to use their own domains (e.g., `dashboard.einstein-school.edu`)
5. **Implement onboarding** - Build signup flow where schools choose their subdomain
6. **Add billing** - Connect Stripe with subdomain-based plans

---

## 💡 Pro Tips

### Tip 1: Reserve Important Subdomains
Before launch, create tenant documents for reserved subdomains to prevent anyone from claiming them:

```javascript
// In Firestore, create documents for:
{ subdomain: 'www', status: 'reserved' }
{ subdomain: 'app', status: 'reserved' }
{ subdomain: 'admin', status: 'reserved' }
{ subdomain: 'api', status: 'reserved' }
```

### Tip 2: Use Subdomain for Feature Flags
Different subdomains can enable different features:

```javascript
if (subdomain === 'beta') {
  enableBetaFeatures();
}
```

### Tip 3: Load Balancing
Wildcard DNS can point to multiple servers for load balancing:

```
*.ishebot.com → Load Balancer → [Server 1, Server 2, Server 3]
```

### Tip 4: Development Subdomains
Use special subdomains for testing:

```
dev.ishebot.com      → Development environment
staging.ishebot.com  → Staging environment
demo.ishebot.com     → Demo with sample data
```

---

## ❓ Frequently Asked Questions

### Q: How many subdomains can I have?
**A:** Unlimited! The wildcard DNS handles all of them. Vercel has no limit on subdomains.

### Q: Do I need to configure DNS for each new school?
**A:** No! The wildcard DNS (set up once) handles all future subdomains automatically.

### Q: Can schools have custom domains (e.g., dashboard.their-school.com)?
**A:** Yes! You can add custom domain support later. Schools add a CNAME record pointing to their subdomain.

### Q: What if two schools want the same subdomain?
**A:** First come, first served. Validate subdomain availability during signup (query Firestore).

### Q: Can I change a school's subdomain after creation?
**A:** Technically yes, but not recommended. Better to support custom domains for rebranding.

### Q: Does this work with other hosting providers?
**A:** Yes! The concept works with any provider (Netlify, AWS, Google Cloud), but implementation differs.

### Q: How do I handle SEO with subdomains?
**A:** Each subdomain is a separate site for SEO. Set unique `<title>` and `<meta>` tags per tenant.

### Q: Can I use this for mobile apps?
**A:** Yes! Mobile apps can use the same subdomain URLs for API calls. Just detect tenant from subdomain in backend.

---

**Last Updated:** 2025-10-26
**Version:** 1.0
**Author:** Claude Code AI Assistant

---

**Need help with any step? Let me know!**
