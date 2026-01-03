# Firestore Indexes Guide

## Current Status: ✅ No Indexes Required

As of January 2025, the ISHEBOT application uses **simple Firestore queries** that do NOT require composite indexes. All queries are either:
- Single document fetches by ID
- Collection scans (no `where()` clauses)
- Simple queries that use automatic single-field indexes

---

## Current Queries (No Indexes Needed)

### 1. Get Stats (`getStatsFromFirestore`)
```typescript
collection(db, `schools/${SCHOOL_ID}/students`)
getDocs(studentsRef) // Collection scan - no index needed
```
**Type**: Full collection scan
**Index Required**: None
**Performance**: Good for < 10,000 students

### 2. Get All Students (`getAllStudentsFromFirestore`)
```typescript
collection(db, `schools/${SCHOOL_ID}/students`)
getDocs(studentsRef) // Collection scan - no index needed
```
**Type**: Full collection scan
**Index Required**: None
**Performance**: Good for < 10,000 students

### 3. Get Student (`getStudentFromFirestore`)
```typescript
doc(db, `schools/${SCHOOL_ID}/students`, studentId)
getDoc(studentRef) // Single document fetch - automatic index
```
**Type**: Single document by ID
**Index Required**: None (automatic)
**Performance**: Excellent

---

## Future Query Scenarios (Would Need Indexes)

### Scenario 1: Filter Students by Class
If you add a feature to filter students by class:

```typescript
query(
  collection(db, `schools/${SCHOOL_ID}/students`),
  where('classId', '==', 'א1'),
  orderBy('name')
)
```

**Required Index**:
- Collection: `students`
- Fields: `classId` (Ascending), `name` (Ascending)

### Scenario 2: Filter Students by Date Range
```typescript
query(
  collection(db, `schools/${SCHOOL_ID}/students`),
  where('date', '>=', '2024-01-01'),
  where('date', '<=', '2024-12-31'),
  orderBy('date', 'desc')
)
```

**Required Index**:
- Collection: `students`
- Fields: `date` (Descending)

### Scenario 3: Filter by Class and Quarter
```typescript
query(
  collection(db, `schools/${SCHOOL_ID}/students`),
  where('classId', '==', 'א1'),
  where('quarter', '==', 'Q1'),
  orderBy('date')
)
```

**Required Index**:
- Collection: `students`
- Fields: `classId` (Ascending), `quarter` (Ascending), `date` (Ascending)

---

## How to Create Firestore Indexes (When Needed)

### Option 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Firestore Database** → **Indexes**
3. Click **Add Index**
4. Configure:
   - Collection ID: `students` (or full path like `schools/{schoolId}/students`)
   - Fields: Add fields in order
   - Query Scope: Collection (not Collection Group)
5. Click **Create**

### Option 2: Firebase CLI (Recommended for Teams)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "students",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "classId", "order": "ASCENDING"},
        {"fieldPath": "name", "order": "ASCENDING"}
      ]
    }
  ],
  "fieldOverrides": []
}
```

3. Deploy:
```bash
firebase deploy --only firestore:indexes
```

### Option 3: Automatic Link (Best for Development)

When you run a query that needs an index, Firestore returns an error with a direct link to create the index. Click it!

---

## Index Best Practices

1. **Only create indexes you actually use** - Each index costs storage and slows down writes
2. **Monitor usage** - Delete indexes unused for 30+ days
3. **Use `array-contains` for array queries** - No index needed for single array field
4. **Consider index size** - Large indexes impact performance
5. **Single-field indexes are free** - Firestore creates them automatically

---

## Monitoring & Maintenance

### Check Index Usage
1. Firebase Console → Firestore → Indexes
2. Review "Last used" column
3. Delete unused indexes

### Estimate Costs
- **Storage**: Each index entry counts toward 1MB doc limit
- **Writes**: Each write updates all indexes
- **Reads**: Indexes reduce document reads (cheaper)

---

## Quick Reference

| Query Type | Index Needed | Action |
|------------|--------------|--------|
| `getDoc(id)` | No (automatic) | None |
| `getDocs(collection)` | No | None |
| `where(field, ==, value)` | No (automatic) | None |
| `where(...).orderBy(field)` | **Yes** | Create index |
| Multiple `where()` + `orderBy()` | **Yes** | Create index |
| Range queries (`>=`, `<=`) + `orderBy()` | **Yes** | Create index |

---

**Last Updated**: 2025-01-02
**Status**: ✅ Production ready (no indexes needed)
**Database**: ISHEBOT Firestore Database
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
