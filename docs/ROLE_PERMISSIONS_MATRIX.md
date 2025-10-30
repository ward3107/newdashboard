# Role Permissions Matrix

**Quick Reference Guide for Multi-Tenant Access Control**

---

## 📊 Student Access by Role

| Role | Can View Students | Scope | Can Edit |
|------|------------------|-------|----------|
| **Admin** (Developer) | ✅ ALL students | Across ALL schools | ✅ YES |
| **School Manager** | ✅ ALL students | In THEIR school ONLY | ✅ YES |
| **Consultant** | ✅ ALL students | In ASSIGNED schools | ❌ READ-ONLY |
| **Teacher** | ✅ ASSIGNED students ONLY | Only assigned to them | ❌ NO |

---

## 🔑 Complete Permissions Matrix

| Permission | Admin | School Manager | Consultant | Teacher |
|-----------|-------|---------------|------------|---------|
| **STUDENT ACCESS** |
| View all students in all schools | ✅ | ❌ | ❌ | ❌ |
| View all students in their school | ✅ | ✅ | ❌ | ❌ |
| View all students in assigned schools | ✅ | ✅ | ✅ | ❌ |
| View only assigned students | ✅ | ✅ | ✅ | ✅ |
| Edit student data | ✅ | ✅ | ❌ | ❌ |
| Delete student data | ✅ | ✅ | ❌ | ❌ |
| **USER MANAGEMENT** |
| Create/edit school admins | ✅ | ❌ | ❌ | ❌ |
| Create/edit consultants | ✅ | ❌ | ❌ | ❌ |
| Invite teachers | ✅ | ✅ | ❌ | ❌ |
| Manage teacher assignments | ✅ | ✅ | ❌ | ❌ |
| View teacher list | ✅ | ✅ | ✅ | ❌ |
| **SCHOOL MANAGEMENT** |
| Create schools | ✅ | ❌ | ❌ | ❌ |
| View all schools | ✅ | ❌ | ❌ | ❌ |
| Edit school settings | ✅ | ✅ (own) | ❌ | ❌ |
| Manage subscription | ✅ | ✅ (own) | ❌ | ❌ |
| Delete school | ✅ | ❌ | ❌ | ❌ |
| **CLASSES & ASSIGNMENTS** |
| View all classes (school) | ✅ | ✅ | ✅ | ❌ |
| View assigned classes only | ✅ | ✅ | ✅ | ✅ |
| Create/edit classes | ✅ | ✅ | ❌ | ❌ |
| Assign students to teachers | ✅ | ✅ | ❌ | ❌ |
| **REPORTS & ANALYTICS** |
| View platform analytics | ✅ | ❌ | ❌ | ❌ |
| View school analytics | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| View class analytics | ✅ | ✅ | ✅ | ✅ (assigned) |
| View student analytics | ✅ | ✅ | ✅ | ✅ (assigned) |
| Export reports (all) | ✅ | ✅ (own school) | ✅ (assigned schools) | ❌ |
| Export reports (assigned) | ✅ | ✅ | ✅ | ✅ |
| **SYSTEM** |
| Access admin panel | ✅ | ✅ | ❌ | ❌ |
| Access developer tools | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ (own school) | ❌ | ❌ |
| Platform configuration | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Data Visibility Examples

### Example School Setup:
- **School A**: 200 students, 10 teachers
- **School B**: 350 students, 15 teachers
- **School C**: 180 students, 8 teachers

### Scenario 1: Admin (Developer)
**Access:**
- School A: ✅ ALL 200 students
- School B: ✅ ALL 350 students
- School C: ✅ ALL 180 students
- **Total visible:** 730 students

### Scenario 2: School Manager (School A)
**Access:**
- School A: ✅ ALL 200 students
- School B: ❌ 0 students
- School C: ❌ 0 students
- **Total visible:** 200 students

### Scenario 3: Consultant (assigned to School A, School B)
**Access:**
- School A: ✅ ALL 200 students (read-only)
- School B: ✅ ALL 350 students (read-only)
- School C: ❌ 0 students
- **Total visible:** 550 students (read-only)

### Scenario 4: Teacher (assigned 30 students in School A)
**Access:**
- School A: ✅ 30 assigned students ONLY
- School B: ❌ 0 students
- School C: ❌ 0 students
- Other 170 students in School A: ❌ NOT visible
- **Total visible:** 30 students

---

## 🔒 Security Rules Summary

### Firestore Rules Logic:

```javascript
// ADMIN - See everything
if (role === 'super_admin') {
  return true; // Full access
}

// SCHOOL MANAGER - See their school
if (role === 'school_admin' && student.schoolId === user.schoolId) {
  return true;
}

// CONSULTANT - See assigned schools (read-only)
if (role === 'consultant' && student.schoolId in user.consultantAccess.schoolIds) {
  return true; // Read only
}

// TEACHER - See assigned students only
if (role === 'teacher' && user.uid in student.assignedTeacherIds) {
  return true; // Read only
}

return false; // Deny by default
```

---

## 🎨 UI Access Control

### Navigation Menu by Role:

#### Admin (Developer)
```
├── Dashboard (Platform Overview)
├── Schools (List all schools)
├── Analytics (Platform-wide)
├── Subscriptions & Billing
├── Users (All users)
└── Settings (Platform config)
```

#### School Manager
```
├── Dashboard (School overview)
├── Students (All in school)
├── Teachers (Manage teachers)
├── Classes (Manage classes)
├── Analytics (School-wide)
├── Reports (Export)
└── Settings (School settings)
```

#### Consultant
```
├── Dashboard (Multi-school view)
├── Schools (Assigned schools selector)
├── Students (All in assigned schools - READ ONLY)
├── Analytics (Multi-school analytics)
└── Reports (Export reports)
```

#### Teacher
```
├── Dashboard (Class overview)
├── My Students (Assigned only)
├── My Classes (Assigned only)
├── Analytics (Class-level)
└── Reports (Assigned students)
```

---

## 📝 Implementation Notes

### API Filtering Pattern:

```typescript
// Frontend sends request
const response = await getStudents();

// Backend automatically filters based on authenticated user
function getStudents(user: User) {
  if (user.role === 'super_admin') {
    return db.students.findAll(); // NO FILTER
  }

  if (user.role === 'school_admin') {
    return db.students.where('schoolId', '==', user.schoolId);
  }

  if (user.role === 'consultant') {
    return db.students.where('schoolId', 'in', user.consultantAccess.schoolIds);
  }

  if (user.role === 'teacher') {
    return db.students.where('assignedTeacherIds', 'array-contains', user.uid);
  }

  return []; // No access
}
```

### Component Access Control:

```tsx
function StudentList() {
  const { user } = useAuth();
  const permissions = usePermissions();

  // Show/hide UI based on permissions
  return (
    <div>
      <h1>Students</h1>

      {permissions.canViewAllStudents && (
        <SchoolSelector /> // Only for Admin, Manager, Consultant
      )}

      {permissions.canEditStudentData && (
        <AddStudentButton /> // Only for Admin, Manager
      )}

      {user.role === 'teacher' && (
        <div className="alert">
          Viewing only your assigned students
        </div>
      )}

      <StudentTable />
    </div>
  );
}
```

---

## ⚠️ Critical Security Checklist

- [ ] **Firestore security rules deployed** (enforce at DB level)
- [ ] **All API calls filter by schoolId** (backend validation)
- [ ] **UI hides actions user can't perform** (better UX)
- [ ] **Consultant access has expiration date** (security)
- [ ] **Teacher assignments validated** (prevent unauthorized access)
- [ ] **Audit logging for cross-school access** (compliance)
- [ ] **Rate limiting per school** (prevent abuse)
- [ ] **Data export logs who exported what** (audit trail)

---

## 🚀 Quick Implementation Guide

### Step 1: Update User Model
Add `schoolId` and `consultantAccess` to User interface

### Step 2: Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Step 3: Update API Calls
Add automatic filtering to all `getStudents()` calls

### Step 4: Update UI Components
Add role-based rendering with `usePermissions()` hook

### Step 5: Test Each Role
Create test accounts for each role and verify access

---

**Last Updated:** 2025-10-30
**Version:** 1.0
**Status:** Implementation Ready ✅
