# Firestore Indexes Guide

This document lists all the Firestore indexes needed for optimal query performance in ISHEBOT.

## Why Indexes Matter

Firestore automatically creates indexes for simple queries (single field). However, **composite queries** (queries with multiple `where()` clauses) require manual index creation.

Without indexes:
- Queries will fail with error: *"The query requires an index"*
- Queries will be slow
- Costs will be higher (more document reads)

---

## Required Indexes

### 1. Students by School and Class

**Query:**
```typescript
// Get all students in a specific school and class
const q = query(
  collection(db, 'schools', schoolId, 'students'),
  where('classId', '==', '8A'),
  where('quarter', '==', 'Q1')
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `students` | `classId` (Asc), `quarter` (Asc) | Collection |
| `students` | `classId` (Asc), `quarter` (Asc), `studentCode` (Asc) | Collection |

**How to create:**
1. Go to [Firebase Console → Firestore → Indexes](https://console.firebase.google.com/project/_/firestore/indexes)
2. Click "Add Index"
3. Collection ID: `students`
4. Fields: `classId` (Ascending), `quarter` (Ascending)
5. Click "Create"

---

### 2. Students by School and Quarter

**Query:**
```typescript
// Get all students for a specific quarter
const q = query(
  collection(db, 'schools', schoolId, 'students'),
  where('quarter', '==', 'Q2'),
  orderBy('date', 'desc')
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `students` | `quarter` (Asc), `date` (Desc) | Collection |

---

### 3. Students by Learning Style

**Query:**
```typescript
// Get all students with a specific learning style
const q = query(
  collection(db, 'schools', schoolId, 'students'),
  where('learningStyle', '==', 'Visual'),
  orderBy('name', 'asc')
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `students` | `learningStyle` (Asc), `name` (Asc) | Collection |

---

### 4. Users by School and Role

**Query:**
```typescript
// Get all teachers in a specific school
const q = query(
  collection(db, 'users'),
  where('schoolId', '==', 'school-123'),
  where('role', '==', 'TEACHER')
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `users` | `schoolId` (Asc), `role` (Asc) | Collection |
| `users` | `schoolId` (Asc), `role` (Asc), `isActive` (Asc) | Collection |

---

### 5. Users by Email (for login)

**Query:**
```typescript
// Get user by email (Firebase Auth already does this, but useful for admin queries)
const q = query(
  collection(db, 'users'),
  where('email', '==', 'teacher@school.com')
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `users` | `email` (Asc) | Collection (Auto-created) |

*Note: This index is usually auto-created by Firestore.*

---

### 6. Active Users by School

**Query:**
```typescript
// Get all active users in a school
const q = query(
  collection(db, 'users'),
  where('schoolId', '==', 'school-123'),
  where('isActive', '==', true)
);
```

**Index:**
| Collection ID | Fields Indexed | Query Scope |
|---------------|----------------|-------------|
| `users` | `schoolId` (Asc), `isActive` (Asc) | Collection |

---

## Auto-Created Indexes (Single Field)

These indexes are created automatically by Firestore. You don't need to create them manually.

| Collection | Field | Usage |
|------------|-------|-------|
| `users` | `email` | User lookup by email |
| `users` | `schoolId` | Get all users in a school |
| `users` | `role` | Get users by role |
| `users` | `isActive` | Get active/inactive users |
| `users` | `uid` | User lookup by ID (primary key) |
| `students` | `classId` | Get students by class |
| `students` | `quarter` | Get students by quarter |
| `students` | `studentCode` | Student lookup by code |
| `students` | `learningStyle` | Get students by learning style |

---

## How to Create Indexes

### Method 1: Firebase Console (Recommended for Beginners)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add Index**
5. Fill in:
   - **Collection ID**: The collection name (e.g., `students`)
   - **Fields**: Add fields and select Ascending/Descending
6. Click **Create**

### Method 2: Firebase CLI (Recommended for Production)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Initialize Firestore in your project:
   ```bash
   firebase init firestore
   ```

3. Edit `firestore.indexes.json`:
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "students",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "classId", "order": "ASCENDING" },
           { "fieldPath": "quarter", "order": "ASCENDING" }
         ]
       },
       {
         "collectionGroup": "students",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "quarter", "order": "ASCENDING" },
           { "fieldPath": "date", "order": "DESCENDING" }
         ]
       },
       {
         "collectionGroup": "users",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "schoolId", "order": "ASCENDING" },
           { "fieldPath": "role", "order": "ASCENDING" }
         ]
       }
     ],
     "fieldOverrides": []
   }
   ```

4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Method 3: Auto-Create from Error Message

When you run a query that needs an index, Firestore will provide a link in the error message:

```
The query requires an index. You can create it here:
https://console.firebase.google.com/project/your-project/firestore/indexes?create_index=...
```

Click the link to create the index automatically.

---

## Index Best Practices

### ✅ DO:

- Create indexes before deploying queries
- Use composite indexes for queries with multiple `where()` clauses
- Use the Firebase CLI to manage indexes in production
- Monitor index usage in Firebase Console
- Delete unused indexes to save costs

### ❌ DON'T:

- Create too many indexes (each index costs money)
- Create indexes on fields that change frequently
- Ignore index error messages
- Use indexes for very small collections (<100 documents)

---

## Index Costs

Firestore charges based on:
1. **Indexed entries**: Each document in the index = 1 entry
2. **Storage**: Indexes take up storage space

| Index Size | Monthly Cost (approx.) |
|------------|------------------------|
| 10,000 entries | ~$0.18 |
| 100,000 entries | ~$1.80 |
| 1,000,000 entries | ~$18.00 |

*Pricing as of 2025. Check [Firebase Pricing](https://firebase.google.com/pricing) for current rates.*

---

## Monitoring Index Usage

1. Go to [Firebase Console → Firestore → Indexes](https://console.firebase.google.com)
2. Check the **"Usage"** column
3. If an index shows 0% usage, consider deleting it

---

## Common Queries & Required Indexes

| Query | Needs Index? | Index Fields |
|-------|--------------|--------------|
| `where('classId', '==', '8A')` | No (single field) | Auto-created |
| `where('classId', '==', '8A').where('quarter', '==', 'Q1')` | Yes | `classId`, `quarter` |
| `where('classId', '==', '8A').orderBy('name')` | Yes | `classId`, `name` |
| `where('role', '==', 'TEACHER').where('isActive', '==', true)` | Yes | `role`, `isActive` |
| `orderBy('date').limit(10)` | No (single sort) | Auto-created |
| `where('quarter', '==', 'Q1').orderBy('date')` | Yes | `quarter`, `date` |

---

## Troubleshooting

### Error: "The query requires an index"

**Solution**: Click the link in the error message to create the index, or add it to `firestore.indexes.json`.

### Error: "Index not found"

**Solution**: Wait a few minutes after creating the index. Indexes take time to build.

### Query is slow

**Solution**: Check if you're missing an index. Use Firestore's query explain feature.

### Too many indexes

**Solution**: Review index usage and delete unused indexes.

---

## Checklist

Before launching ISHEBOT, ensure:

- [ ] All composite indexes listed above are created
- [ ] Indexes are deployed via Firebase CLI (for version control)
- [ ] Test all queries to ensure they work
- [ ] Monitor index usage in Firebase Console
- [ ] Document any custom indexes added later

---

## Related Files

- **Firestore Rules**: `firestore.rules` - Security rules for data access
- **Firestore Config**: `src/config/firebase.ts` - Firebase initialization
- **API Service**: `src/services/firestoreApi.ts` - Database queries
