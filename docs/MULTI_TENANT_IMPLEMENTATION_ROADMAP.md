# Multi-Tenant Implementation Roadmap
## AI Student Analytics Dashboard - School/Manager/Consultant/Teacher

---

## 🎯 Executive Summary

**Current Status:** ✅ 70% Complete - Strong foundation already built!

**What You Have:**
- ✅ Firebase Auth & Firestore configured
- ✅ User roles: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER
- ✅ School data model with subscriptions
- ✅ Complete AuthContext with login/signup
- ✅ Permission system (useAuth hooks)
- ✅ Role-based access control foundation

**What's Needed:**
- ❌ Consultant role implementation
- ❌ Data isolation by schoolId in all APIs
- ❌ Firestore security rules
- ❌ School onboarding & user invitation flows
- ❌ Multi-tenant UI components
- ❌ Admin dashboards for each role

---

## 📊 Role Hierarchy (SIMPLIFIED)

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN (Developer/Platform Owner)            │
│  - Full platform access                                      │
│  - See ALL schools, ALL students                             │
│  - Manage subscriptions & billing                            │
│  - Platform analytics & monitoring                           │
│  - Create/suspend schools                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────┴─────────────┬──────────────────┐
      │                          │                   │
┌─────▼───────────┐      ┌──────▼──────┐    ┌──────▼─────────┐
│ SCHOOL MANAGER  │      │ CONSULTANT  │    │ SCHOOL         │
│ (School Admin)  │      │ (External)  │    │ (Tenant)       │
└─────────────────┘      └─────────────┘    └────────────────┘
│                        │
│ - See ALL students     │ - See ALL students
│   in THEIR school      │   (across assigned schools)
│ - Manage teachers      │ - View only (no edit)
│ - Manage classes       │ - Export reports
│ - School settings      │ - Analytics access
│ - Reports & analytics  │
│                        │
└──────┬─────────────────┘
       │
┌──────▼─────┐
│  TEACHER   │
│            │
│ - See ONLY │
│   assigned │
│   students │
│ - Assigned │
│   classes  │
│ - Reports  │
└────────────┘
```

---

## 🏗️ Phase 1: Core Multi-Tenant Infrastructure (Week 1-2)

### 1.1 Update Type Definitions

**File:** `src/types/auth.ts`

```typescript
// ADD CONSULTANT ROLE
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',  // Rename to MANAGER
  CONSULTANT = 'consultant',       // NEW
  TEACHER = 'teacher',
}

// UPDATE User interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string;                 // Primary school (for Manager/Teacher)
  schoolIds?: string[];             // Multiple schools (for Consultant)
  photoURL?: string;

  // Teacher-specific fields
  assignedClasses?: string[];       // Only for TEACHER role
  assignedStudentIds?: string[];    // Only for TEACHER role

  // Consultant-specific fields
  consultantAccess?: ConsultantAccess;  // Only for CONSULTANT role

  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  phoneNumber?: string;
}

// NEW: Consultant access configuration
export interface ConsultantAccess {
  schoolIds: string[];              // Schools they can access (ALL students)
  expiresAt?: Date;                 // Optional access expiration
  canExportData: boolean;           // Can export reports
  canViewAnalytics: boolean;        // Can view analytics
  notes?: string;                   // Why they have access
}

// UPDATE Permissions
export interface Permissions {
  // Student Access
  canViewAllStudents: boolean;      // Admin: ALL | Manager: their school | Consultant: ALL (assigned schools) | Teacher: NO
  canViewAssignedStudents: boolean; // Teacher: YES (only assigned)
  canEditStudentData: boolean;      // Admin: YES | Manager: YES | Consultant: NO | Teacher: NO

  // User Management
  canManageTeachers: boolean;       // Admin: YES | Manager: YES | Consultant: NO | Teacher: NO
  canInviteUsers: boolean;          // Admin: YES | Manager: YES (teachers) | Consultant: NO | Teacher: NO

  // School Management
  canManageSchool: boolean;         // Admin: YES | Manager: YES | Consultant: NO | Teacher: NO
  canAccessAdminPanel: boolean;     // Admin: YES | Manager: YES | Consultant: NO | Teacher: NO
  canManageSubscription: boolean;   // Admin: YES | Manager: YES | Consultant: NO | Teacher: NO

  // Data & Reports
  canExportData: boolean;           // Admin: YES | Manager: YES | Consultant: YES | Teacher: YES (assigned)
  canViewAnalytics: boolean;        // All roles: YES (but different scopes)
  canDeleteData: boolean;           // Admin: YES (all) | Manager: YES (their school) | Others: NO
}
```

### 1.2 Update Student Data Model

**File:** `src/types/student.ts` (create new file)

```typescript
export interface Student {
  // Identifiers
  id: string;                       // Unique student ID
  studentCode: string;              // School-specific code
  schoolId: string;                 // 🔑 CRITICAL: Tenant isolation

  // Basic Info
  name: string;
  classId: string;
  quarter: string;
  date: string;

  // Academic Data
  learningStyle: string;
  keyNotes: string;
  strengthsCount: number;
  challengesCount: number;

  // Assignments
  primaryTeacherId?: string;        // Main teacher
  assignedTeacherIds?: string[];    // All assigned teachers

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                // User UID who created
  isActive: boolean;
}

export interface DetailedStudent extends Student {
  student_summary: {
    learning_style: string;
    key_notes: string;
    strengths: string[];
    challenges: string[];
  };
  insights: Insight[];
  immediate_actions: ImmediateAction[];
  seating_arrangement: {
    location: string;
    partner_type: string;
    avoid: string;
  };
}
```

### 1.3 Firestore Security Rules

**File:** `firestore.rules` (create in project root)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserRole() == 'super_admin';
    }

    function isSchoolAdmin(schoolId) {
      return isAuthenticated() &&
             getUserRole() == 'school_admin' &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId == schoolId;
    }

    function isConsultant() {
      return isAuthenticated() && getUserRole() == 'consultant';
    }

    function hasSchoolAccess(schoolId) {
      return isSuperAdmin() ||
             isSchoolAdmin(schoolId) ||
             (isConsultant() &&
              schoolId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.consultantAccess.schoolIds);
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;

      // Super admins can read/write all users
      allow read, write: if isSuperAdmin();

      // School admins can read/write users in their school
      allow read, write: if isAuthenticated() &&
                            isSchoolAdmin(resource.data.schoolId);
    }

    // Schools collection
    match /schools/{schoolId} {
      // Super admins have full access
      allow read, write: if isSuperAdmin();

      // School admins can read/update their own school
      allow read, update: if isSchoolAdmin(schoolId);

      // Consultants can read schools they have access to
      allow read: if hasSchoolAccess(schoolId);
    }

    // Students collection - CRITICAL SECURITY (UPDATED)
    match /students/{studentId} {
      // ADMIN: Full access to ALL students
      allow read, write: if isSuperAdmin();

      // SCHOOL MANAGER: Full access to students in THEIR school
      allow read, write: if isAuthenticated() &&
                            isSchoolAdmin(resource.data.schoolId);

      // CONSULTANT: Read-only access to students in ASSIGNED schools
      allow read: if isConsultant() &&
                     hasSchoolAccess(resource.data.schoolId);

      // TEACHER: Read ONLY students assigned to them
      allow read: if isAuthenticated() &&
                     getUserRole() == 'teacher' &&
                     request.auth.uid in resource.data.assignedTeacherIds;
    }

    // Analytics collection
    match /analytics/{schoolId}/{document=**} {
      allow read: if hasSchoolAccess(schoolId);
      allow write: if isSuperAdmin() || isSchoolAdmin(schoolId);
    }
  }
}
```

---

## 🔧 Phase 2: API Updates for Multi-Tenancy (Week 2-3)

### 2.1 Update API Service with Tenant Isolation

**File:** `src/services/api.ts`

Add schoolId filtering to all queries:

```typescript
// BEFORE
export async function getAllStudents(): Promise<ApiResponse<{ students: Student[] }>> {
  return apiCall<{ students: Student[] }>('getAllStudents');
}

// AFTER
export async function getAllStudents(
  schoolId?: string
): Promise<ApiResponse<{ students: Student[] }>> {
  const params = schoolId ? { schoolId } : {};
  return apiCall<{ students: Student[] }>('getAllStudents', params);
}

// NEW: Get students with automatic filtering based on user role
export async function getStudentsForCurrentUser(
  user: User
): Promise<ApiResponse<{ students: Student[] }>> {

  // ADMIN: See ALL students across ALL schools
  if (user.role === UserRole.SUPER_ADMIN) {
    return getAllStudents(); // No filter - returns everything
  }

  // SCHOOL MANAGER: See ALL students in THEIR school
  else if (user.role === UserRole.SCHOOL_ADMIN) {
    return getAllStudents(user.schoolId);
  }

  // CONSULTANT: See ALL students in ASSIGNED schools
  else if (user.role === UserRole.CONSULTANT && user.consultantAccess) {
    const promises = user.consultantAccess.schoolIds.map(schoolId =>
      getAllStudents(schoolId)
    );
    const results = await Promise.all(promises);
    const allStudents = results.flatMap(r => r.data?.students || []);
    return { success: true, data: { students: allStudents } };
  }

  // TEACHER: See ONLY assigned students
  else if (user.role === UserRole.TEACHER) {
    return getAssignedStudents(user.uid, user.schoolId);
  }

  // Fallback: No access
  return { success: true, data: { students: [] } };
}

// NEW: Get students assigned to a specific teacher
export async function getAssignedStudents(
  teacherId: string,
  schoolId: string
): Promise<ApiResponse<{ students: Student[] }>> {
  return apiCall<{ students: Student[] }>('getAssignedStudents', {
    teacherId,
    schoolId
  });
}
```

### 2.2 Update Google Apps Script Backend

**File:** `google-apps-scripts/Code.gs`

Add schoolId parameter to all functions:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const schoolId = e.parameter.schoolId; // NEW: Extract schoolId

  // Validate schoolId for non-super-admin requests
  if (action === 'getAllStudents' && schoolId) {
    return getStudentsBySchool(schoolId);
  }

  // ... rest of code
}

function getStudentsBySchool(schoolId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Students');
  const data = sheet.getDataRange().getValues();

  // Filter by schoolId column (add this column to your sheet!)
  const students = data.filter(row => row[SCHOOL_ID_COLUMN] === schoolId);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      students: students
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🎨 Phase 3: UI Components for Multi-Tenancy (Week 3-4)

### 3.1 School Selector Component (for Super Admins & Consultants)

**File:** `src/components/multi-tenant/SchoolSelector.tsx` (create)

```typescript
import React from 'react';
import { useAuth, usePermissions } from '@/hooks/useAuth';
import { Building2, ChevronDown } from 'lucide-react';

export function SchoolSelector() {
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = React.useState<string>(user?.schoolId || '');
  const [schools, setSchools] = React.useState<School[]>([]);

  // Fetch schools based on user role
  React.useEffect(() => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      // Fetch all schools
      fetchAllSchools().then(setSchools);
    } else if (user?.role === UserRole.CONSULTANT && user.consultantAccess) {
      // Fetch only assigned schools
      fetchSchoolsByIds(user.consultantAccess.schoolIds).then(setSchools);
    }
  }, [user]);

  if (!user || user.role === UserRole.TEACHER || user.role === UserRole.SCHOOL_ADMIN) {
    // Single school users don't need selector
    return null;
  }

  return (
    <div className="relative">
      <select
        value={selectedSchool}
        onChange={(e) => {
          setSelectedSchool(e.target.value);
          // Update global school context
          updateSelectedSchool(e.target.value);
        }}
        className="px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white"
      >
        <option value="">All Schools</option>
        {schools.map(school => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
      <Building2 className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
}
```

### 3.2 Role-Based Dashboard Components

**File:** `src/components/dashboards/RoleDashboard.tsx` (create)

```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// Import role-specific dashboards
import SuperAdminDashboard from './SuperAdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import ConsultantDashboard from './ConsultantDashboard';
import TeacherDashboard from './TeacherDashboard';

export function RoleDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in</div>;
  }

  switch (user.role) {
    case UserRole.SUPER_ADMIN:
      return <SuperAdminDashboard />;

    case UserRole.SCHOOL_ADMIN:
      return <ManagerDashboard />;

    case UserRole.CONSULTANT:
      return <ConsultantDashboard />;

    case UserRole.TEACHER:
      return <TeacherDashboard />;

    default:
      return <div>Unknown role</div>;
  }
}
```

---

## 👥 Phase 4: User Management & Invitations (Week 4-5)

### 4.1 Teacher/User Invitation System

**File:** `src/components/admin/UserInvitation.tsx` (create)

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { Mail, UserPlus } from 'lucide-react';

export function UserInvitation() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    try {
      // Create invitation in Firestore
      await createInvitation({
        email,
        role,
        displayName,
        schoolId: user!.schoolId,
        invitedBy: user!.uid,
        createdAt: new Date(),
        status: 'pending',
      });

      // Send invitation email
      await sendInvitationEmail(email, user!.schoolId);

      alert('Invitation sent successfully!');
      setEmail('');
      setDisplayName('');
    } catch (error) {
      alert('Failed to send invitation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        Invite User
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="teacher@school.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value={UserRole.TEACHER}>Teacher</option>
            {user?.role === UserRole.SUPER_ADMIN && (
              <option value={UserRole.SCHOOL_ADMIN}>School Admin</option>
            )}
            {user?.role === UserRole.SUPER_ADMIN && (
              <option value={UserRole.CONSULTANT}>Consultant</option>
            )}
          </select>
        </div>

        <button
          onClick={handleInvite}
          disabled={loading || !email || !displayName}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Mail className="h-5 w-5" />
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Invitation Acceptance Flow

**File:** `src/pages/AcceptInvitation.tsx` (create)

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const invitationId = searchParams.get('id');

  useEffect(() => {
    // Fetch invitation details
    if (invitationId) {
      fetchInvitation(invitationId).then(setInvitation);
    }
  }, [invitationId]);

  const handleAccept = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await signup({
        email: invitation.email,
        password,
        displayName: invitation.displayName,
        schoolId: invitation.schoolId,
        role: invitation.role,
      });

      // Mark invitation as accepted
      await updateInvitation(invitationId, { status: 'accepted' });

      navigate('/dashboard');
    } catch (error) {
      alert('Failed to accept invitation: ' + error.message);
    }
  };

  if (!invitation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Accept Invitation</h1>
        <p className="mb-4">You've been invited to join as {invitation.role}</p>

        {/* Password form... */}

        <button onClick={handleAccept} className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Accept & Create Account
        </button>
      </div>
    </div>
  );
}
```

---

## 🏫 Phase 5: School Onboarding (Week 5-6)

### 5.1 School Registration Flow

**File:** `src/pages/SchoolOnboarding.tsx` (create)

```typescript
export function SchoolOnboarding() {
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    adminEmail: '',
    adminName: '',
    adminPassword: '',
    subscriptionTier: SubscriptionTier.TRIAL,
  });

  const handleSubmit = async () => {
    try {
      // 1. Create school in Firestore
      const schoolId = await createSchool({
        name: schoolData.name,
        address: schoolData.address,
        adminEmail: schoolData.adminEmail,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionTier: schoolData.subscriptionTier,
        maxTeachers: getMaxTeachers(schoolData.subscriptionTier),
        maxStudents: getMaxStudents(schoolData.subscriptionTier),
        createdAt: new Date(),
        isActive: true,
      });

      // 2. Create admin user
      await signup({
        email: schoolData.adminEmail,
        password: schoolData.adminPassword,
        displayName: schoolData.adminName,
        schoolId,
        role: UserRole.SCHOOL_ADMIN,
      });

      // 3. Send welcome email
      await sendWelcomeEmail(schoolData.adminEmail, schoolId);

      // 4. Redirect to dashboard
      navigate(`/dashboard?school=${schoolId}`);
    } catch (error) {
      alert('Onboarding failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to ISHEBOT</h1>

        {/* Multi-step form */}
        {step === 1 && <SchoolInfoStep data={schoolData} setData={setSchoolData} />}
        {step === 2 && <AdminInfoStep data={schoolData} setData={setSchoolData} />}
        {step === 3 && <SubscriptionStep data={schoolData} setData={setSchoolData} />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}>Back</button>
          )}
          {step < 3 && (
            <button onClick={() => setStep(step + 1)}>Next</button>
          )}
          {step === 3 && (
            <button onClick={handleSubmit}>Complete Setup</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### ✅ Phase 1: Core Infrastructure (Week 1-2)
- [ ] Update `src/types/auth.ts` with Consultant role
- [ ] Create `src/types/student.ts` with schoolId
- [ ] Create `firestore.rules` with security rules
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Update `src/hooks/useAuth.ts` with Consultant permissions
- [ ] Test security rules in Firebase console

### ✅ Phase 2: API Updates (Week 2-3)
- [ ] Update `src/services/api.ts` with schoolId filtering
- [ ] Create `getStudentsForCurrentUser()` helper
- [ ] Update Google Apps Script with schoolId support
- [ ] Add schoolId column to Google Sheets
- [ ] Test API calls with different roles
- [ ] Update all existing API calls to include schoolId

### ✅ Phase 3: UI Components (Week 3-4)
- [ ] Create `SchoolSelector` component
- [ ] Create `RoleDashboard` component
- [ ] Create `SuperAdminDashboard`
- [ ] Create `ManagerDashboard`
- [ ] Create `ConsultantDashboard`
- [ ] Update `TeacherDashboard` with scoped data
- [ ] Add school context provider

### ✅ Phase 4: User Management (Week 4-5)
- [ ] Create `UserInvitation` component
- [ ] Create `AcceptInvitation` page
- [ ] Implement invitation email sending
- [ ] Create Firestore `invitations` collection
- [ ] Add user management panel for admins
- [ ] Test invitation flow end-to-end

### ✅ Phase 5: School Onboarding (Week 5-6)
- [ ] Create `SchoolOnboarding` page
- [ ] Create `SchoolSettings` page
- [ ] Implement school creation flow
- [ ] Add subscription management
- [ ] Create welcome email template
- [ ] Test complete onboarding flow

### ✅ Phase 6: Testing & Polish (Week 6-7)
- [ ] Test all roles with different schools
- [ ] Test data isolation (critical!)
- [ ] Test permissions for each role
- [ ] Performance testing with multiple schools
- [ ] E2E tests for multi-tenant flows
- [ ] Security audit
- [ ] Documentation for each role

---

## 🚀 Quick Start Guide

### For Developers:

1. **Update Types:**
   ```bash
   # Update auth types first
   code src/types/auth.ts
   ```

2. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Test with Different Roles:**
   ```bash
   # Create test users for each role
   npm run seed:test-users
   ```

### For School Setup:

1. **Super Admin creates school**
2. **School Admin receives invitation**
3. **School Admin invites teachers**
4. **Teachers accept and start using**

---

## 📊 Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|-----------|
| Phase 1: Core Infrastructure | 1-2 weeks | Medium |
| Phase 2: API Updates | 1 week | High |
| Phase 3: UI Components | 1-2 weeks | Medium |
| Phase 4: User Management | 1 week | Medium |
| Phase 5: School Onboarding | 1-2 weeks | Low |
| Phase 6: Testing & Polish | 1 week | High |
| **TOTAL** | **6-8 weeks** | **Medium-High** |

---

## 🔐 Security Considerations

1. **Data Isolation:** CRITICAL - Every query MUST filter by schoolId
2. **Firestore Rules:** Test thoroughly before production
3. **API Validation:** Always validate schoolId on backend
4. **Role Checks:** Use useAuth hooks consistently
5. **Consultant Access:** Expire access after period
6. **Audit Logging:** Track all cross-school access

---

## 💰 Cost Implications

**Firebase Costs (estimate per 1000 schools):**
- Firestore: ~$200-500/month
- Auth: Free (50k users)
- Storage: ~$50-100/month

**Optimization:**
- Use Firestore indexes efficiently
- Cache frequently accessed data
- Implement read quotas per school
- Use Firebase billing alerts

---

## 📚 Additional Resources Needed

1. **Email Service:** SendGrid/Mailgun for invitations
2. **Payment Gateway:** Stripe for subscriptions
3. **Analytics:** Track usage per school
4. **Support System:** Help desk for each school
5. **Documentation:** User guides for each role

---

## ✨ You're Almost There!

Your platform is **70% ready** for multi-tenancy. The heavy lifting (auth, roles, permissions) is done!

**Next Steps:**
1. Start with Phase 1 (update types & security rules)
2. Test security rules thoroughly
3. Update APIs to respect schoolId
4. Build role-specific dashboards
5. Launch with 1-2 pilot schools first

**Questions?** Let me know which phase you want to start with!
