# School Onboarding & Activation Flow

**Complete end-to-end process for new schools subscribing to ISHEBOT**

---

## 🎯 Overview

When a new school wants to use ISHEBOT, they go through a self-service onboarding flow that:
1. Creates their account (tenant)
2. Sets up their admin user
3. Activates their subscription
4. Gives them immediate access to the platform

**No manual intervention needed - fully automated!**

---

## 📋 Complete Onboarding Flow

### Option 1: Free Trial → Paid Subscription (RECOMMENDED)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: School Discovery                                    │
│ Where: https://ishebot.com (marketing website)              │
├─────────────────────────────────────────────────────────────┤
│ School admin visits marketing website                       │
│ Reads about features, pricing, case studies                 │
│ Clicks "Start Free Trial" or "Sign Up"                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Registration Form                                   │
│ Where: https://ishebot.com/signup                          │
├─────────────────────────────────────────────────────────────┤
│ School admin fills form:                                    │
│ ✓ School name: "Einstein High School"                      │
│ ✓ School email: admin@einstein.edu.il                      │
│ ✓ Subdomain choice: "einstein" (becomes einstein.ishebot.com)│
│ ✓ Contact name: "Sarah Cohen"                              │
│ ✓ Phone number: +972-XX-XXXXXXX                            │
│ ✓ Number of students: ~350                                 │
│ ✓ Plan selection: Free Trial / Basic / Premium             │
│                                                              │
│ Clicks "Create Account"                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Account Creation (Automated)                        │
│ Backend: Firebase Function "createSchoolAccount"            │
├─────────────────────────────────────────────────────────────┤
│ System automatically:                                        │
│                                                              │
│ 1. ✓ Validates subdomain is available                      │
│ 2. ✓ Validates email domain (school email)                 │
│ 3. ✓ Creates Firebase Auth account                         │
│ 4. ✓ Sends email verification                              │
│ 5. ✓ Creates tenant document in Firestore:                 │
│      {                                                       │
│        tenantId: "school-einstein-jerusalem",               │
│        subdomain: "einstein",                               │
│        name: "Einstein High School",                        │
│        status: "trial",  // or "pending_payment"            │
│        plan: "free",                                        │
│        createdAt: timestamp,                                │
│        trialEndsAt: timestamp + 14 days,                    │
│        maxStudents: 50                                      │
│      }                                                       │
│ 6. ✓ Creates admin user in users collection:               │
│      {                                                       │
│        userId: "user123",                                   │
│        tenantId: "school-einstein-jerusalem",               │
│        email: "admin@einstein.edu.il",                      │
│        role: "school-admin",                                │
│        permissions: ["all"]                                 │
│      }                                                       │
│ 7. ✓ Sets Firebase custom claims:                          │
│      setCustomUserClaims(uid, {                             │
│        tenantId: "school-einstein-jerusalem",               │
│        role: "school-admin"                                 │
│      })                                                      │
│ 8. ✓ Sends welcome email with setup instructions           │
│                                                              │
│ Response: "Account created! Please verify your email."      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Email Verification                                  │
│ Where: Email inbox                                          │
├─────────────────────────────────────────────────────────────┤
│ Admin receives email:                                        │
│                                                              │
│ Subject: "Welcome to ISHEBOT - Verify Your Email"          │
│                                                              │
│ Body:                                                        │
│ Hi Sarah,                                                    │
│                                                              │
│ Welcome to ISHEBOT! Your account for Einstein High School   │
│ has been created.                                           │
│                                                              │
│ Your school portal: https://einstein.ishebot.com           │
│                                                              │
│ Please verify your email to activate your account:          │
│ [Verify Email Button]                                       │
│                                                              │
│ Your trial includes:                                        │
│ • 14 days free trial                                        │
│ • Up to 50 students                                         │
│ • AI-powered student analysis                               │
│ • Unlimited teachers                                        │
│                                                              │
│ Need help? Reply to this email or visit docs.ishebot.com   │
│                                                              │
│ Admin clicks "Verify Email"                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 5: First Login & Onboarding Wizard                    │
│ Where: https://einstein.ishebot.com                        │
├─────────────────────────────────────────────────────────────┤
│ Admin signs in with Google OAuth or email/password          │
│                                                              │
│ System detects: First login → Show onboarding wizard        │
│                                                              │
│ Wizard steps (5-10 minutes):                                │
│                                                              │
│ 1. Welcome Screen                                           │
│    "Welcome to ISHEBOT, Sarah! Let's set up your school."  │
│                                                              │
│ 2. School Profile                                           │
│    • Upload school logo                                     │
│    • Choose primary color (for branding)                    │
│    • Confirm school details                                 │
│                                                              │
│ 3. Class Setup                                              │
│    • Add classes (7-1, 7-2, 8-1, etc.)                     │
│    • Or skip and add later                                  │
│                                                              │
│ 4. Invite Teachers                                          │
│    • Enter teacher emails (up to 5 for trial)              │
│    • System sends invitation emails                         │
│    • Or skip and add later                                  │
│                                                              │
│ 5. Connect Data Source                                      │
│    • Option A: Connect Google Form (paste URL)             │
│    • Option B: Create custom questionnaire                  │
│    • Option C: Import CSV of students                       │
│    • Or skip and do manually                                │
│                                                              │
│ 6. Quick Tutorial (2 minutes)                               │
│    • Interactive demo of key features                       │
│    • How to add students                                    │
│    • How to run AI analysis                                 │
│    • How to view insights                                   │
│                                                              │
│ 7. Trial Information                                        │
│    "Your 14-day free trial is now active!                  │
│    Trial ends: [Date]                                       │
│    You can upgrade anytime from Settings → Billing"         │
│                                                              │
│ Clicks "Go to Dashboard"                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6A: Using Free Trial (Days 1-14)                      │
│ Where: https://einstein.ishebot.com                        │
├─────────────────────────────────────────────────────────────┤
│ School admin can now:                                        │
│ ✓ Add up to 50 students                                    │
│ ✓ Invite teachers (unlimited)                              │
│ ✓ Run AI analyses                                          │
│ ✓ View insights and reports                                │
│ ✓ Export data (limited)                                    │
│ ✓ Use all basic features                                   │
│                                                              │
│ Platform shows trial banner:                                │
│ "Trial ends in 10 days. Upgrade to continue using ISHEBOT" │
│                                                              │
│ Reminder emails sent at:                                    │
│ • Day 7: "7 days left in your trial"                       │
│ • Day 12: "2 days left - Don't lose your data!"            │
│ • Day 14: "Trial ended - Upgrade to keep access"           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 6B: Upgrade to Paid Plan                              │
│ Where: https://einstein.ishebot.com/settings/billing       │
├─────────────────────────────────────────────────────────────┤
│ Admin clicks "Upgrade Now" from trial banner or menu        │
│                                                              │
│ Pricing page shows:                                         │
│ ┌─────────────┬─────────────┬─────────────┐               │
│ │   FREE      │    BASIC    │   PREMIUM   │               │
│ ├─────────────┼─────────────┼─────────────┤               │
│ │ 50 students │ 200 students│  Unlimited  │               │
│ │ Basic AI    │ Advanced AI │ Advanced AI │               │
│ │ $0/month    │ $99/month   │ $299/month  │               │
│ │             │ [Select]    │ [Select]    │               │
│ └─────────────┴─────────────┴─────────────┘               │
│                                                              │
│ Admin selects "Basic Plan" → Clicks "Subscribe"            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Payment Processing (Stripe Checkout)               │
│ Where: Stripe hosted checkout page                          │
├─────────────────────────────────────────────────────────────┤
│ System calls Firebase Function "createCheckoutSession":     │
│                                                              │
│ export const createCheckoutSession = async (data) => {      │
│   const { tenantId, priceId } = data;                       │
│                                                              │
│   // Create or retrieve Stripe customer                     │
│   const customer = await stripe.customers.create({          │
│     email: admin@einstein.edu.il,                           │
│     metadata: { tenantId: "school-einstein-jerusalem" }     │
│   });                                                        │
│                                                              │
│   // Create checkout session                                │
│   const session = await stripe.checkout.sessions.create({   │
│     customer: customer.id,                                   │
│     payment_method_types: ['card'],                         │
│     line_items: [{                                          │
│       price: priceId, // "price_basic_monthly"              │
│       quantity: 1                                           │
│     }],                                                      │
│     mode: 'subscription',                                   │
│     success_url: 'https://einstein.ishebot.com/success',   │
│     cancel_url: 'https://einstein.ishebot.com/billing',    │
│     metadata: { tenantId }                                  │
│   });                                                        │
│                                                              │
│   return { sessionId: session.id };                         │
│ }                                                            │
│                                                              │
│ Admin redirected to Stripe checkout:                        │
│ • Enters credit card details                                │
│ • Enters billing address                                    │
│ • Reviews subscription ($99/month)                          │
│ • Clicks "Subscribe"                                        │
│                                                              │
│ Stripe processes payment...                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 8: Webhook Processing (Automatic Activation)          │
│ Backend: Stripe Webhook → Firebase Function                 │
├─────────────────────────────────────────────────────────────┤
│ When payment succeeds, Stripe sends webhook event:          │
│ "customer.subscription.created"                             │
│                                                              │
│ Firebase Function "stripeWebhook" receives event:           │
│                                                              │
│ export const stripeWebhook = async (req, res) => {          │
│   const event = stripe.webhooks.constructEvent(             │
│     req.rawBody,                                            │
│     req.headers['stripe-signature'],                        │
│     WEBHOOK_SECRET                                          │
│   );                                                         │
│                                                              │
│   switch (event.type) {                                     │
│     case 'customer.subscription.created':                   │
│     case 'customer.subscription.updated':                   │
│       const subscription = event.data.object;               │
│       const tenantId = subscription.metadata.tenantId;      │
│                                                              │
│       // Get price ID to determine plan                     │
│       const priceId = subscription.items.data[0].price.id;  │
│       let plan = 'free';                                    │
│       let maxStudents = 50;                                 │
│                                                              │
│       if (priceId === BASIC_PRICE_ID) {                     │
│         plan = 'basic';                                     │
│         maxStudents = 200;                                  │
│       } else if (priceId === PREMIUM_PRICE_ID) {            │
│         plan = 'premium';                                   │
│         maxStudents = 999999; // unlimited                  │
│       }                                                      │
│                                                              │
│       // ACTIVATE SCHOOL IMMEDIATELY                        │
│       await db.collection('tenants').doc(tenantId).update({ │
│         plan: plan,                                         │
│         status: 'active',  // ← ACTIVATED!                 │
│         maxStudents: maxStudents,                           │
│         billingInfo: {                                      │
│           stripeCustomerId: subscription.customer,          │
│           subscriptionId: subscription.id,                  │
│           currentPeriodEnd: new Date(                       │
│             subscription.current_period_end * 1000          │
│           ),                                                │
│           nextBillingDate: new Date(                        │
│             subscription.current_period_end * 1000          │
│           )                                                 │
│         },                                                  │
│         upgradedAt: FieldValue.serverTimestamp()            │
│       });                                                    │
│                                                              │
│       // Send confirmation email                            │
│       await sendEmail({                                     │
│         to: admin@einstein.edu.il,                          │
│         subject: "Subscription Activated!",                 │
│         template: "subscription_success",                   │
│         data: { plan, maxStudents, nextBilling }            │
│       });                                                    │
│                                                              │
│       // Log audit event                                    │
│       await db.collection('auditLogs').add({                │
│         tenantId,                                           │
│         action: 'subscription.activated',                   │
│         plan,                                               │
│         timestamp: FieldValue.serverTimestamp()             │
│       });                                                    │
│                                                              │
│       break;                                                │
│   }                                                          │
│                                                              │
│   res.json({ received: true });                             │
│ };                                                           │
│                                                              │
│ Result: School is now ACTIVE with paid plan!               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 9: Immediate Access Granted                           │
│ Where: https://einstein.ishebot.com                        │
├─────────────────────────────────────────────────────────────┤
│ Admin redirected back from Stripe to success page           │
│                                                              │
│ Success page shows:                                         │
│ ┌───────────────────────────────────────────────┐          │
│ │  ✓ Subscription Activated!                    │          │
│ │                                                │          │
│ │  Your Basic Plan is now active.               │          │
│ │                                                │          │
│ │  What's new:                                  │          │
│  • 200 student limit (was 50)                   │          │
│  • Advanced AI analysis                         │          │
│  • Custom questionnaires                        │          │
│  • PDF & Excel exports                          │          │
│  • Priority support                             │          │
│ │                                                │          │
│ │  Next billing date: Nov 26, 2025              │          │
│ │  Amount: $99/month                             │          │
│ │                                                │          │
│ │  [Go to Dashboard]  [View Invoice]            │          │
│ └───────────────────────────────────────────────┘          │
│                                                              │
│ System also shows:                                          │
│ • Removes trial banner                                     │
│ • Updates UI to show "Basic Plan" badge                    │
│ • Unlocks premium features                                 │
│ • Shows student limit: 150/200                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 10: Confirmation Email Sent                           │
│ Where: Email inbox                                          │
├─────────────────────────────────────────────────────────────┤
│ Admin receives email within 1 minute:                       │
│                                                              │
│ Subject: "Welcome to ISHEBOT Basic Plan!"                  │
│                                                              │
│ Body:                                                        │
│ Hi Sarah,                                                    │
│                                                              │
│ Great news! Your subscription to ISHEBOT Basic Plan is     │
│ now active.                                                 │
│                                                              │
│ Plan Details:                                               │
│ • Plan: Basic                                               │
│ • Price: $99/month                                          │
│ • Student limit: 200                                        │
│ • Next billing: November 26, 2025                           │
│                                                              │
│ Invoice: [View Invoice] [Download PDF]                     │
│                                                              │
│ Your school portal: https://einstein.ishebot.com           │
│                                                              │
│ What you can do now:                                        │
│ ✓ Add up to 200 students                                   │
│ ✓ Create custom questionnaires                             │
│ ✓ Export reports to PDF/Excel                              │
│ ✓ Get priority email support                               │
│                                                              │
│ Need help? Contact support@ishebot.com                     │
│                                                              │
│ Thank you for choosing ISHEBOT!                            │
│ The ISHEBOT Team                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Alternative Onboarding: Direct Paid Signup (No Trial)

If school wants to skip trial and pay immediately:

```
Same Steps 1-5 as above

BUT at Step 6:
┌─────────────────────────────────────────────────────────────┐
│ Step 6 (Alt): Select Plan During Signup                    │
├─────────────────────────────────────────────────────────────┤
│ Registration form includes plan selection:                   │
│ • Free Trial (14 days, then $0)                             │
│ • Basic Plan ($99/month) ← Selected                         │
│ • Premium Plan ($299/month)                                 │
│                                                              │
│ If paid plan selected:                                      │
│ → Skip trial creation                                       │
│ → Go directly to Stripe checkout (Step 7)                  │
│ → Webhook activates account (Step 8)                       │
│ → Immediate access with paid features (Step 9)             │
│                                                              │
│ Result: Account created as "active" + "basic" immediately   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 How Platform "Knows" It's a New School

### Security Rules Enforce Access

```javascript
// Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Get user's tenant from custom claims
    function getUserTenant() {
      return request.auth.token.tenantId;
    }

    function getTenantStatus(tenantId) {
      let tenant = get(/databases/$(database)/documents/tenants/$(tenantId)).data;
      return tenant.status;
    }

    function belongsToActiveTenant(tenantId) {
      return request.auth != null &&
             getUserTenant() == tenantId &&
             getTenantStatus(tenantId) in ['active', 'trial'];
    }

    // Students collection
    match /students/{studentId} {
      // Can only access if:
      // 1. User is authenticated
      // 2. User's tenantId matches student's tenantId
      // 3. Tenant status is 'active' or 'trial'
      allow read: if belongsToActiveTenant(resource.data.tenantId);

      allow create: if belongsToActiveTenant(request.resource.data.tenantId);
    }

    // Tenants can only access their own data
    match /tenants/{tenantId} {
      allow read: if belongsToActiveTenant(tenantId);
      allow update: if belongsToActiveTenant(tenantId) &&
                       request.auth.token.role == 'school-admin';
    }
  }
}
```

### Frontend Checks Status

```typescript
// src/hooks/useTenant.ts

export function useTenant() {
  const [tenant, setTenant] = useState(null);
  const [accessAllowed, setAccessAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Get tenant from subdomain
      const subdomain = window.location.hostname.split('.')[0];

      const tenantQuery = query(
        collection(db, 'tenants'),
        where('subdomain', '==', subdomain)
      );

      const snapshot = await getDocs(tenantQuery);

      if (!snapshot.empty) {
        const tenantData = snapshot.docs[0].data();

        // CHECK STATUS
        if (tenantData.status === 'active' || tenantData.status === 'trial') {
          setAccessAllowed(true);
          setTenant(tenantData);
        } else if (tenantData.status === 'suspended') {
          // Show "Payment failed - please update payment method"
          setAccessAllowed(false);
        } else if (tenantData.status === 'expired') {
          // Show "Trial expired - please upgrade"
          setAccessAllowed(false);
        }
      }
    };

    checkAccess();
  }, []);

  return { tenant, accessAllowed };
}
```

```typescript
// src/App.tsx

export function App() {
  const { tenant, accessAllowed } = useTenant();
  const { user } = useAuth();

  if (!accessAllowed && tenant?.status === 'expired') {
    return (
      <TrialExpiredScreen
        tenantId={tenant.id}
        onUpgrade={() => window.location.href = '/billing'}
      />
    );
  }

  if (!accessAllowed && tenant?.status === 'suspended') {
    return (
      <PaymentFailedScreen
        tenantId={tenant.id}
        onUpdatePayment={() => window.location.href = '/billing'}
      />
    );
  }

  if (!accessAllowed) {
    return <AccessDeniedScreen />;
  }

  // Normal app
  return <Dashboard />;
}
```

---

## 📊 Tenant Status States

```typescript
// Tenant status field can be:

'pending'    // Account created, email not verified
'trial'      // In free trial period (14 days)
'active'     // Paid subscription active
'suspended'  // Payment failed, temporary suspension
'expired'    // Trial ended, no payment
'canceled'   // User canceled subscription
'deleted'    // Soft delete (for compliance)
```

### Status Transitions

```
pending → trial (when email verified)
         ↓
trial → active (when payment succeeds)
trial → expired (when 14 days pass, no payment)
      ↓
active → suspended (when payment fails)
active → canceled (when user cancels)
       ↓
suspended → active (when payment succeeds)
suspended → canceled (after 30 days of non-payment)
          ↓
expired → active (when user subscribes)
```

---

## ⚙️ Backend Implementation

### Firebase Function: Create School Account

```typescript
// functions/src/onboarding.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

export const createSchoolAccount = functions.https.onCall(async (data, context) => {
  const {
    schoolName,
    subdomain,
    adminEmail,
    adminName,
    contactPhone,
    estimatedStudents,
    selectedPlan
  } = data;

  // Validate subdomain availability
  const existingTenant = await db.collection('tenants')
    .where('subdomain', '==', subdomain)
    .get();

  if (!existingTenant.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      'This subdomain is already taken. Please choose another.'
    );
  }

  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain) || subdomain.length < 3) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Subdomain must be at least 3 characters and contain only lowercase letters, numbers, and hyphens.'
    );
  }

  // Reserved subdomains
  const reserved = ['app', 'admin', 'www', 'api', 'dashboard', 'demo'];
  if (reserved.includes(subdomain)) {
    throw new functions.https.HttpsError(
      'already-exists',
      'This subdomain is reserved. Please choose another.'
    );
  }

  try {
    // 1. Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: adminEmail,
      displayName: adminName,
      emailVerified: false
    });

    // 2. Generate tenant ID
    const tenantId = `school-${subdomain}-${Date.now()}`;

    // 3. Create tenant document
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

    await db.collection('tenants').doc(tenantId).set({
      name: schoolName,
      subdomain,
      domain: null, // Can be set later if they have custom domain
      contactEmail: adminEmail,
      contactName: adminName,
      contactPhone,
      status: selectedPlan === 'free' ? 'trial' : 'pending_payment',
      plan: 'free',
      maxStudents: 50,
      features: ['ai-analysis', 'basic-reports'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      trialEndsAt: selectedPlan === 'free' ? trialEndsAt : null,
      analytics: {
        totalStudents: 0,
        activeTeachers: 0,
        totalAnalyses: 0
      },
      settings: {
        language: 'he',
        academicYear: '2024-2025',
        gradeSystem: estimatedStudents > 300 ? 'high-school' : 'junior-high'
      }
    });

    // 4. Create admin user document
    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      name: adminName,
      displayName: adminName,
      tenantId,
      role: 'school-admin',
      permissions: ['all'],
      classIds: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      preferences: {
        language: 'he',
        notifications: true,
        theme: 'light'
      }
    });

    // 5. Set custom claims for authorization
    await auth.setCustomUserClaims(userRecord.uid, {
      tenantId,
      role: 'school-admin'
    });

    // 6. Send verification email
    const actionCodeSettings = {
      url: `https://${subdomain}.ishebot.com/login?verified=true`,
      handleCodeInApp: false
    };

    const emailVerificationLink = await auth.generateEmailVerificationLink(
      adminEmail,
      actionCodeSettings
    );

    await sendEmail({
      to: adminEmail,
      subject: 'Welcome to ISHEBOT - Verify Your Email',
      template: 'welcome',
      data: {
        name: adminName,
        schoolName,
        subdomain,
        verificationLink: emailVerificationLink,
        trialDays: 14,
        maxStudents: 50
      }
    });

    // 7. Send notification to super admin
    await sendEmail({
      to: 'admin@ishebot.com',
      subject: `New School Signup: ${schoolName}`,
      template: 'admin_notification',
      data: {
        schoolName,
        subdomain,
        adminEmail,
        estimatedStudents,
        selectedPlan
      }
    });

    // 8. Log audit event
    await db.collection('auditLogs').add({
      tenantId,
      action: 'school.created',
      userId: userRecord.uid,
      userEmail: adminEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { subdomain, plan: selectedPlan }
    });

    return {
      success: true,
      tenantId,
      subdomain,
      message: 'Account created successfully! Please check your email to verify your account.'
    };

  } catch (error) {
    console.error('Error creating school account:', error);

    throw new functions.https.HttpsError(
      'internal',
      'Failed to create account. Please try again or contact support.'
    );
  }
});

// Helper: Send email via SendGrid
async function sendEmail(options: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const templates = {
    welcome: 'd-xxxxx', // SendGrid template ID
    admin_notification: 'd-yyyyy',
    subscription_success: 'd-zzzzz'
  };

  const msg = {
    to: options.to,
    from: 'noreply@ishebot.com',
    templateId: templates[options.template],
    dynamicTemplateData: options.data
  };

  await sgMail.send(msg);
}
```

---

## 🎨 Frontend: Signup Form

```typescript
// src/pages/Signup.tsx

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

export function SignupPage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    adminEmail: '',
    adminName: '',
    contactPhone: '',
    estimatedStudents: '',
    selectedPlan: 'free'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const createAccount = httpsCallable(functions, 'createSchoolAccount');
      const result = await createAccount(formData);

      setSuccess(true);
      // Show success message and redirect to email verification page
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          ✓ Account Created Successfully!
        </h2>
        <p className="text-gray-700 mb-4">
          We've sent a verification email to <strong>{formData.adminEmail}</strong>.
        </p>
        <p className="text-gray-700 mb-4">
          Please check your inbox and click the verification link to activate your account.
        </p>
        <p className="text-sm text-gray-600">
          Your school portal will be available at:
          <br />
          <strong>https://{formData.subdomain}.ishebot.com</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Start Your Free Trial</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            School Name *
          </label>
          <input
            type="text"
            value={formData.schoolName}
            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Einstein High School"
            required
          />
        </div>

        {/* Subdomain */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Choose Your School Portal Address *
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formData.subdomain}
              onChange={(e) => setFormData({
                ...formData,
                subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
              })}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="einstein"
              pattern="[a-z0-9-]+"
              minLength={3}
              required
            />
            <span className="text-gray-600">.ishebot.com</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This will be your unique portal URL (e.g., einstein.ishebot.com)
          </p>
        </div>

        {/* Admin Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Admin Email *
          </label>
          <input
            type="email"
            value={formData.adminEmail}
            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="admin@einstein.edu.il"
            required
          />
        </div>

        {/* Admin Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={formData.adminName}
            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Sarah Cohen"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="+972-XX-XXXXXXX"
          />
        </div>

        {/* Students */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Estimated Number of Students
          </label>
          <input
            type="number"
            value={formData.estimatedStudents}
            onChange={(e) => setFormData({ ...formData, estimatedStudents: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="350"
            min="1"
          />
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Choose Your Plan
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, selectedPlan: 'free' })}
              className={`p-4 border-2 rounded-lg ${
                formData.selectedPlan === 'free'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">Free Trial</div>
              <div className="text-sm text-gray-600">14 days free</div>
              <div className="text-sm text-gray-600">50 students</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, selectedPlan: 'basic' })}
              className={`p-4 border-2 rounded-lg ${
                formData.selectedPlan === 'basic'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">Basic</div>
              <div className="text-sm text-gray-600">$99/month</div>
              <div className="text-sm text-gray-600">200 students</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, selectedPlan: 'premium' })}
              className={`p-4 border-2 rounded-lg ${
                formData.selectedPlan === 'premium'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="font-semibold">Premium</div>
              <div className="text-sm text-gray-600">$299/month</div>
              <div className="text-sm text-gray-600">Unlimited</div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-sm text-gray-600 text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}
```

---

## 📧 Email Templates

### Welcome Email (SendGrid Template)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9fafb; }
    .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ISHEBOT!</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>

      <p>Welcome to ISHEBOT! Your account for <strong>{{schoolName}}</strong> has been created successfully.</p>

      <p><strong>Your school portal:</strong><br>
      <a href="https://{{subdomain}}.ishebot.com">https://{{subdomain}}.ishebot.com</a></p>

      <p>Please verify your email address to activate your account:</p>

      <p style="text-align: center; margin: 30px 0;">
        <a href="{{verificationLink}}" class="button">Verify Email Address</a>
      </p>

      <p><strong>Your trial includes:</strong></p>
      <ul>
        <li>{{trialDays}} days free trial</li>
        <li>Up to {{maxStudents}} students</li>
        <li>AI-powered student analysis</li>
        <li>Unlimited teachers</li>
        <li>Basic reports and insights</li>
      </ul>

      <p>After verifying your email, you can:</p>
      <ol>
        <li>Complete your school profile</li>
        <li>Invite teachers</li>
        <li>Add students</li>
        <li>Start analyzing with AI</li>
      </ol>

      <p>Need help getting started? Check our <a href="https://docs.ishebot.com/getting-started">Quick Start Guide</a> or reply to this email.</p>

      <p>Best regards,<br>
      The ISHEBOT Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 🔒 Security Considerations

### 1. Subdomain Validation
- Must be unique
- Must be lowercase alphanumeric + hyphens only
- Minimum 3 characters
- Cannot be reserved words (app, admin, www, api, etc.)

### 2. Email Verification
- Required before full access
- Link expires after 24 hours
- Can resend verification email

### 3. Rate Limiting
- Max 3 signup attempts per IP per hour
- Prevents abuse/spam

### 4. Tenant Isolation
- Every document has `tenantId`
- Security rules enforce tenant boundaries
- Custom claims in Firebase Auth token

### 5. Payment Security
- All payment via Stripe (PCI compliant)
- No credit card data stored in our database
- Webhooks verify signature to prevent tampering

---

## 📊 Monitoring & Analytics

### Track Onboarding Funnel

```typescript
// Track each step

// Step 1: Signup form view
analytics.track('signup_form_viewed', {
  referrer: document.referrer
});

// Step 2: Form submitted
analytics.track('signup_submitted', {
  plan: formData.selectedPlan,
  estimatedStudents: formData.estimatedStudents
});

// Step 3: Account created
analytics.track('account_created', {
  tenantId,
  subdomain,
  plan
});

// Step 4: Email verified
analytics.track('email_verified', {
  tenantId,
  timeSinceSignup: minutes
});

// Step 5: First login
analytics.track('first_login', {
  tenantId
});

// Step 6: Onboarding completed
analytics.track('onboarding_completed', {
  tenantId,
  completionTime: minutes
});

// Step 7: Subscription activated
analytics.track('subscription_activated', {
  tenantId,
  plan,
  amount
});
```

### Conversion Funnel
```
100 visitors → signup page
 80 start form (80%)
 50 submit form (62.5%)
 45 verify email (90%)
 40 complete onboarding (88%)
 15 upgrade to paid (37.5%)
```

---

## ✅ Summary

### How Platform Knows It's a New School:

1. **Signup Form** → School fills form with unique subdomain
2. **Backend Creates** → Firebase Function creates tenant + admin user
3. **Email Sent** → Verification email with portal URL
4. **Email Verified** → School can log in
5. **Trial Active** → Status = "trial", 14 days access
6. **Payment** → Stripe checkout when ready
7. **Webhook** → Stripe notifies our backend
8. **Auto-Activation** → Backend updates status to "active"
9. **Immediate Access** → School has full paid features
10. **Security Rules** → Only allow access if status is active/trial

**No manual intervention needed - 100% automated!**

---

**Questions?** Let me know if you need any clarification on the onboarding flow!
