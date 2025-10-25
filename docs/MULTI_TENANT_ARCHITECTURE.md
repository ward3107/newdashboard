# 🏢 ISHEBOT Multi-Tenant SaaS Architecture

## Table of Contents
1. [The Big Picture Vision](#the-big-picture-vision)
2. [Multi-Tenant Architecture](#multi-tenant-architecture)
3. [Data Model](#data-model)
4. [Security Rules](#security-rules)
5. [Google Forms vs Custom Questionnaire](#google-forms-vs-custom-questionnaire)
6. [Complete Architecture Stack](#complete-architecture-stack)
7. [Multi-Tenant Routing Strategy](#multi-tenant-routing-strategy)
8. [Monetization Strategy](#monetization-strategy)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Recommendations](#recommendations)

---

## The Big Picture Vision

```
Year 1:  1 school (pilot) → 50 students
Year 2:  5-10 schools → 500-1000 students
Year 3:  50+ schools → 5000+ students
Year 5:  National/International → 50K+ students
```

**This is a SaaS platform, not a single-school tool.**

---

## Multi-Tenant Architecture

### Option 1: Shared Database with Tenant Isolation (RECOMMENDED)

```
Single Firebase Project
  ↓
Firestore (with tenantId on every document)
  ↓
Row-Level Security via Firestore Rules
  ↓
Each school = separate tenant
```

**Why This Approach:**

✅ **Everything in one place** - single console, single billing, single SDK
✅ **Real-time updates** - Firestore syncs data instantly across all devices
✅ **Better security** - Built-in security rules, no exposed API URLs
✅ **Offline support** - Firestore caches data automatically
✅ **Better scalability** - Can grow from 50 to 5000 students seamlessly
✅ **Proper backend** - Firebase Functions are more powerful than Apps Script
✅ **Free tier is generous** - 50K reads/day, 20K writes/day, 1GB storage
✅ **Better auth** - Role-based access built-in, multiple providers
✅ **No CORS issues** - Frontend and backend on same domain

**Cons:**

⚠️ Need to migrate from Google Sheets to Firestore (1-2 days work)
⚠️ More complex setup initially
⚠️ May hit free tier limits faster at scale

---

### Option 2: Separate Firebase Project per School (NOT RECOMMENDED)

**Pros:**
- Complete data isolation
- Easier compliance (each school owns their data)

**Cons:**
- ❌ Management nightmare (can't manage 50 Firebase projects)
- ❌ Can't share features across schools
- ❌ Can't do cross-tenant analytics
- ❌ Expensive (need paid plan for each)
- ❌ Deployment complexity (deploy to 50 projects?)

**Verdict:** Only for enterprise clients with strict data sovereignty requirements

---

### Option 3: Hybrid (Database per Tenant)

```
Single Firebase Project
  ↓
Firestore: One database per school
  school-einstein (database)
  school-herzl (database)
  school-rothschild (database)
```

**Pros:**
- True data isolation
- Single Firebase console
- Shared code/functions

**Cons:**
- ⚠️ Firebase limits: 100 databases per project
- ⚠️ More complex queries
- ⚠️ Higher costs

**When to use:** When you have 10+ schools and need strong isolation

---

### Recommendation Strategy

**Phase 1: Pilot (1 school) → Use Option 1**
- Single Firestore database
- Add `tenantId` to all documents from day 1
- Implement tenant isolation in security rules

**Phase 2: Growth (2-10 schools) → Stay with Option 1**
- Same architecture scales fine
- Add school management dashboard
- Implement billing per tenant

**Phase 3: Scale (10+ schools) → Consider Option 3**
- Migrate to database-per-tenant if needed
- Only if compliance requires it

---

## Data Model

### Multi-Tenant Firestore Structure

```javascript
// Collections structure

tenants (collection) // Schools
  /{tenantId} (document) // e.g., "school-einstein-jerusalem"
    - name: "Einstein High School"
    - location: "Jerusalem"
    - domain: "einstein.edu.il" // For domain-based auth
    - subdomain: "einstein" // For einstein.ishebot.com
    - plan: "free" | "basic" | "premium"
    - maxStudents: 500
    - features: ["ai-analysis", "reports", "export"]
    - settings: {
        language: "he",
        academicYear: "2024-2025",
        gradeSystem: "junior-high" | "high-school"
      }
    - contactEmail: "admin@einstein.edu.il"
    - status: "active" | "trial" | "suspended"
    - createdAt: timestamp
    - billingInfo: {
        stripeCustomerId: "cus_xxx",
        subscriptionId: "sub_xxx",
        currentPeriodEnd: timestamp
      }
    - customBranding: {
        logo: "https://storage.../logo.png",
        primaryColor: "#1a73e8",
        secondaryColor: "#34a853",
        schoolName: "בית ספר איינשטיין"
      }
    - analytics: {
        totalStudents: 349,
        activeTeachers: 15,
        totalAnalyses: 1250,
        lastAnalysisDate: timestamp
      }

users (collection)
  /{userId} (document)
    - email: "teacher@school.com"
    - tenantId: "school-einstein-jerusalem" // CRITICAL: Links to school
    - role: "super-admin" | "school-admin" | "teacher" | "student"
    - name: "Sarah Cohen"
    - displayName: "שרה כהן"
    - classIds: ["7-1", "8-2"]
    - permissions: ["view-students", "analyze", "export"]
    - preferences: {
        language: "he",
        notifications: true,
        theme: "light"
      }
    - createdAt: timestamp
    - lastLogin: timestamp
    - invitedBy: "admin@school.com"
    - tenantIds: ["school-einstein", "school-herzl"] // If user works at multiple schools

students (collection)
  /{studentId} (document)
    - tenantId: "school-einstein-jerusalem" // CRITICAL: Tenant isolation
    - studentCode: "einstein-70101" // Prefix with tenant
    - name: "דני כהן"
    - classId: "7-1"
    - teacherId: "user123"
    - quarter: "Q1"
    - academicYear: "2024-2025"
    - grade: 7
    - status: "active" | "graduated" | "transferred"
    - createdAt: timestamp
    - updatedAt: timestamp
    - latestAnalysis: {
        date: timestamp,
        learningStyle: "חזותי",
        strengthsCount: 6,
        challengesCount: 2
      }

    /analyses/{analysisId} (subcollection)
      - tenantId: "school-einstein-jerusalem" // Even in subcollections!
      - date: timestamp
      - quarter: "Q1"
      - learningStyle: "חזותי"
      - keyNotes: "..."
      - strengths: ["..."]
      - challenges: ["..."]
      - insights: [
          {
            category: "Learning",
            icon: "Brain",
            finding: "...",
            recommendations: [...]
          }
        ]
      - immediateActions: [...]
      - seatingArrangement: {
          location: "front",
          partnerType: "supportive",
          avoid: "distractions"
        }
      - analyzedBy: "admin@school.com"
      - aiModel: "gpt-4"
      - processingTime: 3.2 // seconds

classes (collection)
  /{classId} (document)
    - tenantId: "school-einstein-jerusalem"
    - name: "ז-1"
    - grade: 7
    - section: 1
    - teacherId: "user123"
    - teacherName: "Sarah Cohen"
    - studentCount: 25
    - studentIds: ["student1", "student2", ...]
    - academicYear: "2024-2025"
    - schedule: {
        room: "101",
        timeSlots: ["Sunday 08:00-09:00", ...]
      }
    - createdAt: timestamp

questionnaires (collection) // NEW: Custom forms per school
  /{questionnaireId} (document)
    - tenantId: "school-einstein-jerusalem" // School can customize questions
    - name: "Q1 Student Assessment"
    - description: "First quarter comprehensive student evaluation"
    - version: "2024-v1"
    - active: true
    - questions: [
        {
          id: "q1",
          type: "multipleChoice",
          text: "How does the student learn best?",
          textHe: "איך התלמיד לומד הכי טוב?",
          options: ["Visual", "Auditory", "Kinesthetic"],
          optionsHe: ["חזותי", "שמיעתי", "קינסתטי"],
          required: true,
          order: 1
        },
        {
          id: "q2",
          type: "text",
          text: "Describe student's strengths",
          textHe: "תאר את החוזקות של התלמיד",
          maxLength: 500,
          required: true,
          order: 2
        },
        {
          id: "q3",
          type: "rating",
          text: "Rate student's classroom participation",
          textHe: "דרג את השתתפות התלמיד בכיתה",
          scale: 5,
          required: true,
          order: 3
        },
        {
          id: "q4",
          type: "checkbox",
          text: "Select all that apply",
          textHe: "בחר את כל המתאימים",
          options: ["Option A", "Option B", "Option C"],
          optionsHe: ["אופציה א", "אופציה ב", "אופציה ג"],
          required: false,
          order: 4
        },
        {
          id: "q5",
          type: "file",
          text: "Upload student work sample",
          textHe: "העלה דוגמת עבודה של התלמיד",
          maxSize: 10485760, // 10MB
          acceptedTypes: ["image/*", "application/pdf"],
          required: false,
          order: 5,
          conditionalLogic: {
            showIf: {
              questionId: "q1",
              answer: "Visual"
            }
          }
        }
      ]
    - createdBy: "admin@school.com"
    - createdAt: timestamp
    - updatedAt: timestamp
    - stats: {
        totalResponses: 125,
        averageCompletionTime: 8.5 // minutes
      }

responses (collection) // NEW: Student questionnaire responses
  /{responseId} (document)
    - tenantId: "school-einstein-jerusalem"
    - questionnaireId: "q1-assessment"
    - questionnaireVersion: "2024-v1"
    - studentId: "student123"
    - studentCode: "einstein-70101"
    - submittedBy: "teacher@school.com"
    - submittedByName: "Sarah Cohen"
    - answers: {
        "q1": "Visual",
        "q2": "Good at math and science, shows creativity in problem-solving...",
        "q3": 4,
        "q4": ["Option A", "Option C"],
        "q5": "https://storage.googleapis.com/.../sample.pdf"
      }
    - completionTime: 7.2 // minutes
    - submittedAt: timestamp
    - analyzed: true
    - analysisId: "analysis123"
    - analyzedAt: timestamp

analytics (collection) // NEW: Usage tracking per tenant
  /{tenantId}/metrics/{metricId}
    - date: "2024-10-25"
    - tenantId: "school-einstein-jerusalem"
    - metrics: {
        activeUsers: 15,
        activeTeachers: 12,
        activeStudents: 349,
        analysesRun: 23,
        studentsAdded: 5,
        questionnairesCreated: 2,
        responsesSubmitted: 47,
        apiCalls: 156,
        storageUsed: 2.3, // GB
        averageResponseTime: 1.2 // seconds
      }
    - costs: {
        firestoreReads: 15420,
        firestoreWrites: 2340,
        functionInvocations: 234,
        storageGB: 2.3,
        estimatedCost: 0.15 // USD
      }

invitations (collection)
  /{invitationId} (document)
    - tenantId: "school-einstein-jerusalem"
    - email: "newteacher@school.com"
    - role: "teacher"
    - classIds: ["7-1"]
    - invitedBy: "admin@school.com"
    - status: "pending" | "accepted" | "expired"
    - token: "secure-random-token"
    - expiresAt: timestamp
    - createdAt: timestamp
    - acceptedAt: timestamp

auditLogs (collection)
  /{logId} (document)
    - tenantId: "school-einstein-jerusalem"
    - userId: "user123"
    - userEmail: "teacher@school.com"
    - action: "student.analyze" | "user.create" | "data.export"
    - resource: "student123"
    - resourceType: "student"
    - ipAddress: "192.168.1.1" // Hashed in production
    - userAgent: "Mozilla/5.0..."
    - timestamp: timestamp
    - metadata: {
        analysisId: "analysis123",
        duration: 3.2
      }
```

---

## Security Rules

### Firestore Security Rules (Tenant Isolation)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ====================================
    // HELPER FUNCTIONS
    // ====================================

    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function getUserTenant() {
      return getUserData().tenantId;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == 'super-admin';
    }

    function isSchoolAdmin() {
      return isAuthenticated() && getUserData().role == 'school-admin';
    }

    function isTeacher() {
      return isAuthenticated() && getUserData().role == 'teacher';
    }

    function belongsToTenant(tenantId) {
      return isAuthenticated() && getUserTenant() == tenantId;
    }

    function ownsClass(classId) {
      return isAuthenticated() &&
             getUserData().classIds != null &&
             classId in getUserData().classIds;
    }

    function canAccessStudent(studentData) {
      return isSuperAdmin() ||
             (belongsToTenant(studentData.tenantId) &&
              (isSchoolAdmin() || ownsClass(studentData.classId)));
    }

    function hasPermission(permission) {
      return isAuthenticated() &&
             getUserData().permissions != null &&
             permission in getUserData().permissions;
    }

    function getTenantPlan() {
      let tenantData = get(/databases/$(database)/documents/tenants/$(getUserTenant())).data;
      return tenantData.plan;
    }

    function isWithinTenantLimits(resourceType) {
      let tenantData = get(/databases/$(database)/documents/tenants/$(getUserTenant())).data;

      // Check student limits based on plan
      if (resourceType == 'student') {
        let currentCount = tenantData.analytics.totalStudents;
        return currentCount < tenantData.maxStudents;
      }

      return true;
    }

    // ====================================
    // TENANTS COLLECTION
    // ====================================

    match /tenants/{tenantId} {
      allow read: if belongsToTenant(tenantId) || isSuperAdmin();
      allow create: if isSuperAdmin();
      allow update: if (belongsToTenant(tenantId) && isSchoolAdmin()) || isSuperAdmin();
      allow delete: if isSuperAdmin();
    }

    // ====================================
    // USERS COLLECTION
    // ====================================

    match /users/{userId} {
      // Users can read their own data
      allow read: if isAuthenticated() &&
                     (request.auth.uid == userId ||
                      belongsToTenant(resource.data.tenantId) ||
                      isSuperAdmin());

      // Only admins can create users
      allow create: if isSuperAdmin() || isSchoolAdmin();

      // Users can update their own preferences, admins can update everything
      allow update: if (request.auth.uid == userId &&
                        request.resource.data.role == resource.data.role &&
                        request.resource.data.tenantId == resource.data.tenantId) ||
                       isSchoolAdmin() ||
                       isSuperAdmin();

      // Only super admins can delete users
      allow delete: if isSuperAdmin();
    }

    // ====================================
    // STUDENTS COLLECTION (CRITICAL: Tenant isolation)
    // ====================================

    match /students/{studentId} {
      allow read: if canAccessStudent(resource.data);

      allow create: if isAuthenticated() &&
                       belongsToTenant(request.resource.data.tenantId) &&
                       (isSchoolAdmin() || hasPermission('create-student')) &&
                       isWithinTenantLimits('student');

      allow update: if canAccessStudent(resource.data) &&
                       (isSchoolAdmin() || hasPermission('edit-student'));

      allow delete: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      // Student analyses subcollection
      match /analyses/{analysisId} {
        allow read: if canAccessStudent(
                         get(/databases/$(database)/documents/students/$(studentId)).data
                       );

        allow create: if belongsToTenant(request.resource.data.tenantId) &&
                         (isSchoolAdmin() || hasPermission('analyze-student'));

        allow update, delete: if belongsToTenant(resource.data.tenantId) &&
                                 (isSchoolAdmin() || isSuperAdmin());
      }
    }

    // ====================================
    // CLASSES COLLECTION
    // ====================================

    match /classes/{classId} {
      allow read: if belongsToTenant(resource.data.tenantId) || isSuperAdmin();

      allow create: if belongsToTenant(request.resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      allow update: if belongsToTenant(resource.data.tenantId) &&
                       (ownsClass(classId) || isSchoolAdmin() || isSuperAdmin());

      allow delete: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());
    }

    // ====================================
    // QUESTIONNAIRES COLLECTION
    // ====================================

    match /questionnaires/{questionnaireId} {
      allow read: if belongsToTenant(resource.data.tenantId);

      allow create: if belongsToTenant(request.resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      allow update: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      allow delete: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());
    }

    // ====================================
    // RESPONSES COLLECTION
    // ====================================

    match /responses/{responseId} {
      allow read: if belongsToTenant(resource.data.tenantId);

      allow create: if belongsToTenant(request.resource.data.tenantId) &&
                       (isTeacher() || isSchoolAdmin() || isSuperAdmin());

      allow update: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      allow delete: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());
    }

    // ====================================
    // ANALYTICS COLLECTION
    // ====================================

    match /analytics/{tenantId}/metrics/{metricId} {
      allow read: if belongsToTenant(tenantId) || isSuperAdmin();
      allow write: if isSuperAdmin(); // Only functions can write
    }

    // ====================================
    // INVITATIONS COLLECTION
    // ====================================

    match /invitations/{invitationId} {
      allow read: if belongsToTenant(resource.data.tenantId) ||
                     resource.data.email == request.auth.token.email;

      allow create: if belongsToTenant(request.resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());

      allow update: if resource.data.email == request.auth.token.email ||
                       isSchoolAdmin();

      allow delete: if belongsToTenant(resource.data.tenantId) &&
                       (isSchoolAdmin() || isSuperAdmin());
    }

    // ====================================
    // AUDIT LOGS COLLECTION
    // ====================================

    match /auditLogs/{logId} {
      allow read: if belongsToTenant(resource.data.tenantId) &&
                     (isSchoolAdmin() || isSuperAdmin());
      allow write: if false; // Only Cloud Functions can write logs
    }
  }
}
```

---

## Google Forms vs Custom Questionnaire

### The Decision Framework

#### Phase 1: Pilot (Google Forms) ✅

**Use Google Forms for:**
- Initial pilot with 1 school
- First 3-5 schools
- Quick validation
- Minimal development time

**Pros:**
- ✅ Already built in your codebase
- ✅ Teachers know how to use it
- ✅ Free and reliable
- ✅ Collect data FAST (focus on pilot success)
- ✅ Easy to iterate (change questions without coding)
- ✅ School already trusts Google

**Cons:**
- ⚠️ Not white-labeled (says "Google Forms")
- ⚠️ No tenant-specific customization
- ⚠️ Feels less "premium"
- ⚠️ You don't control the UX

**Verdict:** Perfect for pilot, good enough for first 5 schools

---

#### Phase 2: Growth (Custom Questionnaire) ✅

**Build custom questionnaire when:**
- After pilot succeeds (validated demand)
- When you have 3+ schools signed up
- When schools ask for custom questions
- When you want to monetize (premium features)

**Custom Questionnaire Features:**

```
1. Drag-and-drop form builder
2. Question types:
   - Multiple choice
   - Checkboxes
   - Text (short/long)
   - Rating scales (1-5, emoji)
   - File upload (student work samples)
   - Conditional logic ("if answer X, show question Y")

3. School customization:
   - Custom branding (logo, colors)
   - Translated to school's language
   - Custom question library per school
   - Save as templates

4. Better UX:
   - Progress bar
   - Save draft (resume later)
   - Mobile-optimized
   - Offline support
   - Accessibility (screen reader)

5. Advanced features:
   - Pre-fill student data
   - Batch import students
   - Email reminders to teachers
   - Analytics on completion rates
   - Integration with school SIS
```

---

### Implementation: Custom Questionnaire

#### Backend: Firebase Functions

```typescript
// functions/src/questionnaire.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Create questionnaire
export const createQuestionnaire = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data();

  if (!userData || (userData.role !== 'school-admin' && userData.role !== 'super-admin')) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create questionnaires');
  }

  const { tenantId, name, description, questions } = data;

  // Validate tenant
  if (userData.role !== 'super-admin' && userData.tenantId !== tenantId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot create questionnaire for another tenant');
  }

  // Create questionnaire
  const questionnaireRef = await db.collection('questionnaires').add({
    tenantId,
    name,
    description,
    version: `${new Date().getFullYear()}-v1`,
    active: true,
    questions: questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q${index + 1}`,
      order: index + 1
    })),
    createdBy: context.auth.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    stats: {
      totalResponses: 0,
      averageCompletionTime: 0
    }
  });

  return { success: true, questionnaireId: questionnaireRef.id };
});

// Submit response
export const submitResponse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { questionnaireId, studentId, answers, completionTime } = data;

  // Get questionnaire
  const questionnaireDoc = await db.collection('questionnaires').doc(questionnaireId).get();
  if (!questionnaireDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Questionnaire not found');
  }

  const questionnaire = questionnaireDoc.data()!;

  // Get student
  const studentDoc = await db.collection('students').doc(studentId).get();
  if (!studentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Student not found');
  }

  const student = studentDoc.data()!;

  // Verify user can submit for this tenant
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data()!;

  if (userData.tenantId !== questionnaire.tenantId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot submit response for another tenant');
  }

  // Create response
  const responseRef = await db.collection('responses').add({
    tenantId: questionnaire.tenantId,
    questionnaireId,
    questionnaireVersion: questionnaire.version,
    studentId,
    studentCode: student.studentCode,
    submittedBy: context.auth.email,
    submittedByName: userData.name,
    answers,
    completionTime,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    analyzed: false
  });

  // Update questionnaire stats
  await db.collection('questionnaires').doc(questionnaireId).update({
    'stats.totalResponses': admin.firestore.FieldValue.increment(1),
    'stats.averageCompletionTime': calculateNewAverage(
      questionnaire.stats.averageCompletionTime,
      questionnaire.stats.totalResponses,
      completionTime
    )
  });

  // Trigger AI analysis
  await analyzeStudentFromResponse({ responseId: responseRef.id });

  return { success: true, responseId: responseRef.id };
});

function calculateNewAverage(oldAvg: number, oldCount: number, newValue: number): number {
  return ((oldAvg * oldCount) + newValue) / (oldCount + 1);
}
```

#### Frontend: Questionnaire Builder

```typescript
// src/components/QuestionnaireBuilder.tsx

import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Settings } from 'lucide-react';

interface Question {
  id: string;
  type: 'multipleChoice' | 'text' | 'rating' | 'checkbox' | 'file';
  text: string;
  textHe?: string;
  options?: string[];
  optionsHe?: string[];
  required: boolean;
  maxLength?: number;
  scale?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  conditionalLogic?: {
    showIf: { questionId: string; answer: string };
  };
}

export function QuestionnaireBuilder({ tenantId }: { tenantId: string }) {
  const [questionnaireName, setQuestionnaireName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      text: '',
      required: false,
      ...(type === 'multipleChoice' && { options: [''] }),
      ...(type === 'checkbox' && { options: [''] }),
      ...(type === 'rating' && { scale: 5 }),
      ...(type === 'text' && { maxLength: 500 }),
      ...(type === 'file' && { maxSize: 10485760, acceptedTypes: ['image/*', 'application/pdf'] })
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const saveQuestionnaire = async () => {
    setSaving(true);
    try {
      const createQuestionnaire = httpsCallable(functions, 'createQuestionnaire');
      const result = await createQuestionnaire({
        tenantId,
        name: questionnaireName,
        description,
        questions
      });

      alert('Questionnaire created successfully!');
      // Reset form or navigate away
    } catch (error) {
      console.error('Error creating questionnaire:', error);
      alert('Failed to create questionnaire');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Build Student Assessment Form</h1>

      {/* Questionnaire metadata */}
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Questionnaire Name</label>
          <input
            type="text"
            value={questionnaireName}
            onChange={(e) => setQuestionnaireName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Q1 Student Assessment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
            placeholder="First quarter comprehensive student evaluation"
          />
        </div>
      </div>

      {/* Question types toolbar */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => addQuestion('multipleChoice')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Multiple Choice
        </button>
        <button
          onClick={() => addQuestion('text')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Text Answer
        </button>
        <button
          onClick={() => addQuestion('rating')}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Rating Scale
        </button>
        <button
          onClick={() => addQuestion('checkbox')}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Checkboxes
        </button>
        <button
          onClick={() => addQuestion('file')}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
        >
          <Plus size={20} />
          File Upload
        </button>
      </div>

      {/* Drag-and-drop questions */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <SortableQuestionCard
                key={question.id}
                question={question}
                index={index}
                onUpdate={(updates) => updateQuestion(index, updates)}
                onDelete={() => deleteQuestion(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {questions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No questions yet. Click a button above to add your first question.
        </div>
      )}

      {/* Save button */}
      {questions.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveQuestionnaire}
            disabled={saving || !questionnaireName}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Questionnaire'}
          </button>
        </div>
      )}
    </div>
  );
}

function SortableQuestionCard({
  question,
  index,
  onUpdate,
  onDelete
}: {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-2"
        >
          <GripVertical size={20} />
        </button>

        {/* Question content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              Question {index + 1} - {question.type}
            </span>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <input
            type="text"
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2"
            placeholder="Question text (English)"
          />

          <input
            type="text"
            value={question.textHe || ''}
            onChange={(e) => onUpdate({ textHe: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-3"
            placeholder="Question text (Hebrew)"
          />

          {/* Type-specific fields */}
          {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Options:</label>
              {question.options?.map((option, optIndex) => (
                <div key={optIndex} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[optIndex] = e.target.value;
                      onUpdate({ options: newOptions });
                    }}
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  {optIndex === question.options!.length - 1 && (
                    <button
                      onClick={() => onUpdate({ options: [...(question.options || []), ''] })}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div>
              <label className="text-sm font-medium">Scale (1-{question.scale}):</label>
              <input
                type="number"
                value={question.scale}
                onChange={(e) => onUpdate({ scale: parseInt(e.target.value) })}
                min={2}
                max={10}
                className="ml-2 px-3 py-1 border rounded w-20"
              />
            </div>
          )}

          {question.type === 'text' && (
            <div>
              <label className="text-sm font-medium">Max Length:</label>
              <input
                type="number"
                value={question.maxLength}
                onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) })}
                className="ml-2 px-3 py-1 border rounded w-24"
              />
            </div>
          )}

          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
              />
              Required
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Frontend: Questionnaire Form (Student Response)

```typescript
// src/components/QuestionnaireForm.tsx

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../services/firebase';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export function QuestionnaireForm({
  questionnaireId,
  studentId
}: {
  questionnaireId: string;
  studentId: string;
}) {
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuestionnaire();
  }, [questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'questionnaires', questionnaireId));
      if (docSnap.exists()) {
        setQuestionnaire({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error loading questionnaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questionnaire?.questions[currentStep];

  const canProceed = () => {
    if (!currentQuestion?.required) return true;
    const answer = answers[currentQuestion.id];

    if (currentQuestion.type === 'checkbox') {
      return answer && answer.length > 0;
    }

    return answer !== undefined && answer !== null && answer !== '';
  };

  const submitResponse = async () => {
    setSubmitting(true);
    try {
      const completionTime = (Date.now() - startTime) / 1000 / 60; // minutes

      const submitResponseFn = httpsCallable(functions, 'submitResponse');
      await submitResponseFn({
        questionnaireId,
        studentId,
        answers,
        completionTime
      });

      alert('Response submitted successfully! AI analysis will begin shortly.');
      // Reset or navigate away
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading questionnaire...</div>;
  }

  if (!questionnaire) {
    return <div className="text-center py-12">Questionnaire not found</div>;
  }

  const progress = ((currentStep + 1) / questionnaire.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{questionnaire.name}</h1>
      <p className="text-gray-600 mb-6">{questionnaire.description}</p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentStep + 1} of {questionnaire.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      {currentQuestion && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {currentQuestion.textHe || currentQuestion.text}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h2>

          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => setAnswers({ ...answers, [currentQuestion.id]: value })}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        {currentStep < questionnaire.questions.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={submitResponse}
            disabled={!canProceed() || submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? 'Submitting...' : (
              <>
                <CheckCircle size={20} />
                Submit & Analyze
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  value,
  onChange
}: {
  question: any;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (question.type) {
    case 'multipleChoice':
      return (
        <div className="space-y-2">
          {question.options.map((option: string, index: number) => (
            <label key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4"
              />
              <span>{question.optionsHe?.[index] || option}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {question.options.map((option: string, index: number) => (
            <label key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value?.includes(option) || false}
                onChange={(e) => {
                  const current = value || [];
                  if (e.target.checked) {
                    onChange([...current, option]);
                  } else {
                    onChange(current.filter((v: string) => v !== option));
                  }
                }}
                className="w-4 h-4"
              />
              <span>{question.optionsHe?.[index] || option}</span>
            </label>
          ))}
        </div>
      );

    case 'text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.maxLength}
          className="w-full px-4 py-2 border rounded-lg"
          rows={5}
          placeholder="Type your answer here..."
        />
      );

    case 'rating':
      return (
        <div className="flex gap-2">
          {Array.from({ length: question.scale }, (_, i) => i + 1).map((rating) => (
            <button
              key={rating}
              onClick={() => onChange(rating)}
              className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                value === rating
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      );

    case 'file':
      return (
        <input
          type="file"
          accept={question.acceptedTypes?.join(',')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size <= question.maxSize) {
              // Upload to Firebase Storage
              // For now, just store filename
              onChange(file.name);
            } else if (file) {
              alert(`File too large. Max size: ${question.maxSize / 1024 / 1024}MB`);
            }
          }}
          className="w-full px-4 py-2 border rounded-lg"
        />
      );

    default:
      return <div>Unknown question type</div>;
  }
}
```

---

## Complete Architecture Stack

### The Full Multi-Tenant SaaS Stack

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│ Vercel (Multi-tenant React App)                         │
│ - Dynamic subdomain routing: einstein.ishebot.com       │
│ - Tenant detection from subdomain                       │
│ - Shared UI components, tenant-specific branding        │
│ - Progressive Web App (offline support)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   AUTHENTICATION                         │
├─────────────────────────────────────────────────────────┤
│ Firebase Auth + Custom Claims                           │
│ - Google OAuth (auto-detect tenant from email domain)   │
│ - Custom claims: { tenantId, role, permissions }        │
│ - Multi-factor auth for admins                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                         │
├─────────────────────────────────────────────────────────┤
│ Firebase Functions (Node.js/TypeScript)                 │
│                                                          │
│ 1. School Management:                                   │
│    - createTenant(), updateTenant(), deleteTenant()     │
│    - upgradePlan(), downgradePlan()                     │
│                                                          │
│ 2. User Management:                                     │
│    - inviteUser(), assignRole(), revokeAccess()         │
│    - setCustomClaims(uid, { tenantId, role })           │
│                                                          │
│ 3. Student Operations:                                  │
│    - importStudents(tenantId, csvFile)                  │
│    - analyzeStudent(studentId)                          │
│    - bulkAnalyze(tenantId, studentIds[])                │
│                                                          │
│ 4. Questionnaire Engine:                                │
│    - createQuestionnaire(tenantId, questions)           │
│    - submitResponse(responseId)                         │
│    - autoAnalyzeOnSubmit() // Trigger                   │
│                                                          │
│ 5. Integrations:                                        │
│    - syncFromGoogleForms(tenantId, formUrl)             │
│    - syncFromSIS(tenantId, credentials) // Future       │
│    - webhookHandler(event) // For external systems      │
│                                                          │
│ 6. Analytics & Reporting:                               │
│    - generateTenantReport(tenantId, dateRange)          │
│    - exportToExcel(tenantId, filters)                   │
│    - emailWeeklyDigest(tenantId)                        │
│                                                          │
│ 7. AI Processing:                                       │
│    - analyzeWithOpenAI(formData)                        │
│    - generateInsights(studentHistory)                   │
│    - recommendActions(analysis)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                        │
├─────────────────────────────────────────────────────────┤
│ Firestore (Multi-tenant with row-level security)        │
│ - All documents have tenantId field                     │
│ - Composite indexes for tenant-scoped queries           │
│ - Security rules enforce tenant isolation               │
│                                                          │
│ Collections:                                            │
│ - tenants (schools)                                     │
│ - users (teachers, admins)                              │
│ - students (per tenant)                                 │
│ - classes (per tenant)                                  │
│ - questionnaires (per tenant)                           │
│ - responses (per tenant)                                │
│ - analytics (per tenant metrics)                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                      │
├─────────────────────────────────────────────────────────┤
│ OpenAI API        - AI student analysis                 │
│ SendGrid          - Transactional emails                │
│ Stripe            - Subscription billing                │
│ Google Sheets API - Legacy form sync                    │
│ Sentry            - Error tracking                      │
│ LogTail           - Centralized logging                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  SUPER ADMIN PORTAL                      │
├─────────────────────────────────────────────────────────┤
│ admin.ishebot.com (Separate app)                        │
│ - Manage all tenants                                    │
│ - Monitor usage & billing                               │
│ - View aggregated analytics                             │
│ - Support tickets & chat                                │
│ - Feature flags & A/B testing                           │
└─────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Routing Strategy

### Subdomain-based Tenancy (RECOMMENDED)

```
einstein.ishebot.com   → Einstein High School
herzl.ishebot.com      → Herzl Middle School
rothschild.ishebot.com → Rothschild Academy
app.ishebot.com        → Demo/trial (no tenant)
admin.ishebot.com      → Super admin portal
```

### Implementation

```typescript
// src/hooks/useTenant.ts

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useTenant() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectTenant = async () => {
      // Get subdomain from URL
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];

      if (subdomain === 'app' || subdomain === 'localhost') {
        // Demo mode or local development
        setTenant(null);
        setLoading(false);
        return;
      }

      if (subdomain === 'admin') {
        // Super admin portal
        setTenant({ type: 'admin' });
        setLoading(false);
        return;
      }

      // Fetch tenant config from Firestore
      const tenantQuery = query(
        collection(db, 'tenants'),
        where('subdomain', '==', subdomain),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(tenantQuery);

      if (!snapshot.empty) {
        const tenantData = snapshot.docs[0].data();
        setTenant({
          id: snapshot.docs[0].id,
          ...tenantData
        });
      } else {
        // Subdomain not found → redirect to main site
        window.location.href = 'https://ishebot.com/404';
      }

      setLoading(false);
    };

    detectTenant();
  }, []);

  return { tenant, loading };
}
```

```typescript
// src/App.tsx - Apply tenant branding

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTenant } from './hooks/useTenant';
import { useAuth } from './hooks/useAuth';

export function App() {
  const { tenant, loading: tenantLoading } = useTenant();
  const { user, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (tenant?.customBranding) {
      // Apply school's custom branding
      document.documentElement.style.setProperty(
        '--primary-color',
        tenant.customBranding.primaryColor
      );

      document.documentElement.style.setProperty(
        '--secondary-color',
        tenant.customBranding.secondaryColor
      );

      document.title = tenant.customBranding.schoolName || 'ISHEBOT';

      // Update favicon
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (favicon && tenant.customBranding.logo) {
        favicon.href = tenant.customBranding.logo;
      }
    }
  }, [tenant]);

  if (tenantLoading || authLoading) {
    return <LoadingScreen />;
  }

  if (!tenant && tenant?.type !== 'admin') {
    return <Navigate to="/demo" />;
  }

  // Verify user belongs to this tenant
  if (user && userData && userData.tenantId !== tenant.id && !userData.role.includes('super-admin')) {
    return <div>Access Denied: You don't belong to this school</div>;
  }

  return (
    <TenantContext.Provider value={tenant}>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/questionnaires" element={<QuestionnaireList />} />
          <Route path="/questionnaires/new" element={<QuestionnaireBuilder tenantId={tenant.id} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </TenantContext.Provider>
  );
}
```

### Vercel Configuration

```json
// vercel.json
{
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

## Monetization Strategy

### Freemium Pricing Model

#### FREE TIER (Pilot Schools)
- Up to 50 students
- 1 admin + 3 teachers
- Basic AI analysis
- Google Forms integration
- Email support (48h response)
- ISHEBOT branding
- **Price: $0/month**

#### BASIC TIER
- Up to 200 students
- Unlimited teachers
- Advanced AI analysis
- Custom questionnaires
- PDF export + Excel reports
- Email support (24h response)
- Remove ISHEBOT branding
- **Price: $99/month or $990/year** (2 months free)

#### PREMIUM TIER
- Unlimited students
- Unlimited teachers
- Advanced AI + trend analysis
- Custom questionnaires + conditional logic
- All export formats + automated reports
- Priority support (4h response) + phone
- Custom branding (logo, colors)
- API access for integrations
- SIS integration (future)
- Dedicated account manager
- **Price: $299/month or $2,990/year**

#### ENTERPRISE (Districts)
- Multiple schools (5-50+)
- District-wide analytics
- White-label option
- SSO integration (SAML, Azure AD)
- Custom features development
- On-premise deployment option
- SLA guarantee (99.9% uptime)
- Training & professional services
- **Price: Custom (starting $1,500/month)**

---

### Stripe Integration

```typescript
// Firebase function for subscription management

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const db = admin.firestore();

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { tenantId, priceId } = data;

  // Verify user is admin of this tenant
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  const userData = userDoc.data()!;

  if (userData.tenantId !== tenantId || userData.role !== 'school-admin') {
    throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  }

  // Get or create Stripe customer
  const tenantDoc = await db.collection('tenants').doc(tenantId).get();
  const tenantData = tenantDoc.data()!;

  let customerId = tenantData.billingInfo?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: context.auth.token.email,
      metadata: { tenantId }
    });
    customerId = customer.id;

    await db.collection('tenants').doc(tenantId).update({
      'billingInfo.stripeCustomerId': customerId
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `https://${tenantData.subdomain}.ishebot.com/settings/billing?success=true`,
    cancel_url: `https://${tenantData.subdomain}.ishebot.com/settings/billing?canceled=true`,
    metadata: { tenantId }
  });

  return { sessionId: session.id };
});

// Webhook handler for subscription events
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook Error');
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata.tenantId;

      // Determine plan from price ID
      const priceId = subscription.items.data[0].price.id;
      let plan = 'free';

      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
        plan = 'basic';
      } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        plan = 'premium';
      }

      await db.collection('tenants').doc(tenantId).update({
        plan,
        status: 'active',
        'billingInfo.subscriptionId': subscription.id,
        'billingInfo.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        maxStudents: plan === 'basic' ? 200 : 999999
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription.metadata.tenantId;

      await db.collection('tenants').doc(tenantId).update({
        plan: 'free',
        status: 'active',
        maxStudents: 50,
        'billingInfo.subscriptionId': admin.firestore.FieldValue.delete()
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Find tenant by customer ID
      const tenants = await db.collection('tenants')
        .where('billingInfo.stripeCustomerId', '==', customerId)
        .get();

      if (!tenants.empty) {
        await tenants.docs[0].ref.update({
          status: 'suspended'
        });

        // Send email notification
        // sendPaymentFailedEmail(...)
      }
      break;
    }
  }

  res.json({ received: true });
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2) - PILOT READY

**Tasks:**
- ✅ Firebase project setup with multi-tenant structure
- ✅ Firestore security rules with tenant isolation
- ✅ Firebase Authentication with Google OAuth
- ✅ Basic frontend with tenant detection
- ✅ Google Forms integration (existing)
- ✅ AI analysis function (migrate from Apps Script)
- ✅ Deploy to Vercel with subdomain routing
- ✅ 1 pilot school onboarded

**Deliverable:** Pilot with School #1 (Einstein) live at `einstein.ishebot.com`

**Cost:** $0 (free tiers)

---

### Phase 2: Multi-Tenant Core (Weeks 3-4)

**Tasks:**
- ✅ School onboarding flow (self-service signup)
- ✅ Admin portal for school admins
- ✅ User invitation system
- ✅ Role-based access control (super-admin, school-admin, teacher)
- ✅ Basic analytics dashboard
- ✅ Email notifications (SendGrid)
- ✅ 2-3 more pilot schools onboarded

**Deliverable:** 3-5 schools using the platform independently

**Cost:** $0-15/month (SendGrid free tier may be exceeded)

---

### Phase 3: Custom Questionnaires (Weeks 5-6)

**Tasks:**
- ✅ Questionnaire builder UI
- ✅ Drag-and-drop question editor
- ✅ Question types (multiple choice, text, rating, file upload)
- ✅ Conditional logic
- ✅ Custom questionnaire per school
- ✅ Response submission form
- ✅ Auto-trigger AI analysis on submission
- ✅ Migrate pilot schools from Google Forms → Custom forms

**Deliverable:** Schools can create their own assessment forms

**Cost:** $0-20/month

---

### Phase 4: Monetization (Weeks 7-8)

**Tasks:**
- ✅ Stripe integration
- ✅ Subscription plans (Free, Basic, Premium)
- ✅ Billing portal
- ✅ Usage limits enforcement
- ✅ Upgrade/downgrade flows
- ✅ Invoice generation
- ✅ Payment success/failure handling

**Deliverable:** Platform can accept paying customers

**Revenue:** First paying customer ($99/month)

---

### Phase 5: Growth Features (Weeks 9-12)

**Tasks:**
- ✅ Advanced analytics & reporting
- ✅ PDF + Excel export improvements
- ✅ Automated weekly email reports
- ✅ Teacher onboarding wizard
- ✅ In-app help & tutorials
- ✅ Mobile app (PWA improvements)
- ✅ Offline support
- ✅ Custom branding per school
- ✅ API for integrations

**Deliverable:** Feature-complete SaaS platform

**Goal:** 10 paying schools, $1,000 MRR

---

### Phase 6: Scale (Months 4-6)

**Tasks:**
- ✅ SIS integration (Moodle, Google Classroom, etc.)
- ✅ SSO (SAML, Azure AD)
- ✅ White-label option for districts
- ✅ Multi-language support (English, Arabic)
- ✅ Advanced AI features (trend analysis, predictions)
- ✅ Parent portal
- ✅ Mobile native apps (iOS, Android)

**Deliverable:** Enterprise-ready platform for school districts

**Goal:** 50 schools, $5,000-10,000 MRR

---

## Recommendations

### Immediate Decisions (This Week)

1. **Architecture:** Full Firebase multi-tenant (Option 1)
2. **Data Collection:** Keep Google Forms for pilot, build custom forms in Phase 3
3. **Deployment:** Vercel + Firebase Functions
4. **Subdomain Strategy:** `{school}.ishebot.com`
5. **Auth:** Firebase Auth with Google OAuth
6. **Pilot Scope:** 1 school (50 students), expand to 3-5 schools in Phase 2

---

### What Can Be Built for You

**Week 1-2 Deliverables (Pilot Foundation):**

1. ✅ Multi-tenant Firestore structure
2. ✅ Security rules with tenant isolation
3. ✅ Firebase Authentication setup
4. ✅ Migrate existing codebase to Firebase SDK
5. ✅ Subdomain-based tenant detection
6. ✅ Deploy to Vercel with custom domains
7. ✅ Migrate AI analysis from Apps Script to Functions
8. ✅ School onboarding script
9. ✅ Basic admin dashboard
10. ✅ Documentation for pilot school setup

**Cost:** Still $0 for pilot (Firebase free tier + Vercel free tier)

---

### Final Questions

1. **Do you have a domain?** (e.g., `ishebot.com`)
2. **Do you have OpenAI API key?** (for AI analysis)
3. **Pilot school confirmed?** (is Einstein example real?)
4. **Timeline urgency?** (Need to launch in 2 weeks or can wait 4 weeks?)
5. **Do you want to start building this architecture NOW?**

---

## Next Steps

If you decide to proceed:

1. Confirm you want Full Firebase multi-tenant architecture
2. Provide domain name (if you have one)
3. Confirm pilot school details
4. I'll start implementing:
   - Multi-tenant Firestore structure
   - Security rules
   - Firebase Auth setup
   - Subdomain routing
   - Migration from Apps Script

**Timeline:** 3-4 days for foundation, 1-2 weeks for pilot-ready deployment

---

**Ready to build the future of student analysis? 🚀**
