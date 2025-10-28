# 🔐 Google Sheets Authentication - Complete Guide

## Overview

A simple authentication system that stores teacher credentials directly in your existing Google Sheet. Perfect for pilots and MVPs.

---

## 📊 The Basic Concept

**Instead of using a separate service (like Firebase), you store teacher credentials directly in your existing Google Sheet.**

This means:
- ✅ No external dependencies
- ✅ Everything in one place
- ✅ Easy to manage (just edit the spreadsheet)
- ✅ Zero cost
- ✅ Quick to implement (2-3 hours)

---

## 🎯 How It Works

### Step 1: Add a "Teachers" Sheet

In your **existing Google Sheet** (the one that already has your 349 students), you add a new tab called "Teachers":

```
Sheet 1: StudentResponses (your existing data)
Sheet 2: AI_Insights (your existing data)
Sheet 3: students (your existing data - 349 students)
Sheet 4: Teachers ← NEW SHEET
```

**The Teachers sheet looks like this:**

| Email | Password | Name | Classes | Role |
|-------|----------|------|---------|------|
| sarah.cohen@school.com | sarah2024 | Sarah Cohen | ז1,ז2 | teacher |
| david.levi@school.com | david2024 | David Levi | ח1,ח2,ח3 | teacher |
| rachel.israel@school.com | rachel2024 | Rachel Israel | ט1 | teacher |
| admin@school.com | admin123 | Admin | * | admin |

**What each column means:**
- **Email:** Teacher's login email
- **Password:** Their password (stored in plain text for pilot simplicity)
- **Name:** Teacher's display name
- **Classes:** Which classes they teach (comma-separated: `ז1,ז2`)
- **Role:** "teacher" or "admin" (admin with `*` sees all students)

---

### Step 2: Teacher Visits Dashboard

When a teacher opens your dashboard (e.g., `https://yoursite.vercel.app`):

```
1. Dashboard loads
2. Checks: "Is anyone logged in?"
3. If NO → Show login page
4. If YES → Show dashboard with their students
```

---

### Step 3: Login Page

Teacher sees a simple login form:

```
┌─────────────────────────────────┐
│   ISHEBOT Dashboard Login       │
├─────────────────────────────────┤
│                                 │
│   Email: [________________]     │
│                                 │
│   Password: [________________]  │
│                                 │
│        [ Login Button ]         │
│                                 │
└─────────────────────────────────┘
```

Teacher enters:
- Email: `sarah.cohen@school.com`
- Password: `sarah2024`

Clicks "Login"

---

### Step 4: Check Credentials

When they click Login, here's what happens:

```javascript
// Frontend (React Dashboard) sends request:
fetch('YOUR_GOOGLE_APPS_SCRIPT_URL?action=login&email=sarah.cohen@school.com&password=sarah2024')

// Google Apps Script receives request
// Opens "Teachers" sheet
// Looks for matching email + password

function authenticateUser(email, password) {
  const teachersSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Teachers');

  const data = teachersSheet.getDataRange().getValues();

  // Loop through each row (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const teacherEmail = row[0];     // Column A: Email
    const teacherPassword = row[1];  // Column B: Password
    const teacherName = row[2];      // Column C: Name
    const teacherClasses = row[3];   // Column D: Classes
    const teacherRole = row[4];      // Column E: Role

    // Check if email and password match
    if (teacherEmail === email && teacherPassword === password) {
      // SUCCESS! Send back teacher info
      return {
        success: true,
        teacher: {
          email: teacherEmail,
          name: teacherName,
          classes: teacherClasses.split(',').map(c => c.trim()), // "ז1,ז2" → ["ז1", "ז2"]
          role: teacherRole
        }
      };
    }
  }

  // No match found
  return {
    success: false,
    error: 'Invalid email or password'
  };
}
```

---

### Step 5: Save Login Info

If credentials are correct:

```javascript
// Frontend receives response:
{
  success: true,
  teacher: {
    email: "sarah.cohen@school.com",
    name: "Sarah Cohen",
    classes: ["ז1", "ז2"],
    role: "teacher"
  }
}

// Save this info in browser
localStorage.setItem('currentUser', JSON.stringify(teacher));

// Redirect to dashboard
navigate('/dashboard');
```

**localStorage** = Browser storage that persists even if user closes tab

---

### Step 6: Filter Students by Teacher

Now when Sarah sees the dashboard, it filters students:

```javascript
// Get all students from Google Sheet (349 students)
const allStudents = await API.getAllStudents();

// Get current logged-in teacher
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Filter students
let studentsToShow;

if (currentUser.role === 'admin' || currentUser.classes.includes('*')) {
  // Admin sees ALL students
  studentsToShow = allStudents;

} else if (currentUser.role === 'teacher') {
  // Teacher sees only THEIR class students
  studentsToShow = allStudents.filter(student =>
    currentUser.classes.includes(student.classId)
  );
}

// Display filtered students
displayStudents(studentsToShow);
```

**Example:**

Sarah teaches classes `ז1` and `ז2`:

```javascript
All students in database: 349

Student #1: { name: "דני כהן", classId: "ז1" }     ✅ Sarah sees this (ז1 is in her classes)
Student #2: { name: "מיכל לוי", classId: "ז2" }     ✅ Sarah sees this (ז2 is in her classes)
Student #3: { name: "יוסי אבן", classId: "ח1" }     ❌ Sarah doesn't see this (ח1 not her class)
Student #4: { name: "שרה ישראל", classId: "ט1" }    ❌ Sarah doesn't see this (ט1 not her class)

Result: Sarah sees only students from ז1 and ז2
```

---

## 🎬 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ 1. Teacher opens dashboard                         │
│    https://yoursite.vercel.app                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 2. Dashboard checks: Is anyone logged in?          │
│    Check localStorage for 'currentUser'            │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
     No logged in      Yes logged in
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ 3a. Show Login   │  │ 3b. Show         │
│     Page         │  │     Dashboard    │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ 4. Teacher enters email + password                  │
│    Email: sarah.cohen@school.com                    │
│    Password: sarah2024                              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 5. Send to Google Apps Script                       │
│    GET: ?action=login&email=...&password=...        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 6. Google Apps Script opens "Teachers" sheet        │
│    Searches for matching email + password           │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    Match found      No match
         │                 │
         ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ 7a. Return       │  │ 7b. Return       │
│     SUCCESS      │  │     ERROR        │
│     + teacher    │  │     "Invalid"    │
│     info         │  │                  │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ 8a. Save to      │  │ 8b. Show error   │
│     localStorage │  │     message      │
│     Redirect to  │  │     Stay on      │
│     dashboard    │  │     login page   │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ 9. Dashboard loads all 349 students                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 10. Filter by teacher's classes                     │
│     Sarah's classes: ז1, ז2                         │
│     Show only students where classId = ז1 OR ז2     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 11. Display filtered students                       │
│     Sarah sees ~70 students (from ז1 + ז2)          │
│     NOT all 349 students                            │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Implementation Code

### Part 1: Google Apps Script (Backend)

Add this to your existing `COMPLETE_INTEGRATED_SCRIPT_OPENAI.js`:

```javascript
/**
 * Authenticate teacher/admin user
 * Checks Teachers sheet for matching email + password
 */
function authenticateUser(email, password) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const teachersSheet = ss.getSheetByName('Teachers');

    if (!teachersSheet) {
      return {
        success: false,
        error: 'Teachers sheet not found. Please create it first.'
      };
    }

    const data = teachersSheet.getDataRange().getValues();

    // Skip header row (row 0)
    for (let i = 1; i < data.length; i++) {
      const [emailCol, passwordCol, nameCol, classesCol, roleCol] = data[i];

      // Check if email and password match
      if (emailCol === email && passwordCol === password) {
        return {
          success: true,
          user: {
            email: emailCol,
            name: nameCol,
            classes: classesCol === '*' ? ['*'] : classesCol.split(',').map(c => c.trim()),
            role: roleCol || 'teacher',
            loginTime: new Date().toISOString()
          }
        };
      }
    }

    // No match found
    return {
      success: false,
      error: 'Invalid email or password'
    };

  } catch (error) {
    return {
      success: false,
      error: 'Authentication error: ' + error.toString()
    };
  }
}

/**
 * Update doGet to handle login action
 */
function doGet(e) {
  const action = e.parameter.action;

  // Handle login action
  if (action === 'login') {
    const email = e.parameter.email;
    const password = e.parameter.password;

    if (!email || !password) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const result = authenticateUser(email, password);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ... your existing actions (getAllStudents, getStudent, etc.)

  if (action === 'getAllStudents') {
    // Your existing getAllStudents code
  }

  // ... other actions
}
```

---

### Part 2: React Login Page (Frontend)

Create `src/components/LoginPage.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call Google Apps Script
      const response = await fetch(
        `${API_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        throw new Error('Network error');
      }

      const result = await response.json();

      if (result.success) {
        // Save user info to localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'התחברות נכשלה');
      }
    } catch (err) {
      setError('שגיאה בהתחברות. בדוק את החיבור לאינטרנט ונסה שוב.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ISHEBOT Dashboard
          </h1>
          <p className="text-gray-600">התחברות למורים</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="teacher@school.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                מתחבר...
              </>
            ) : (
              'התחבר'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>לבעיות התחברות, פנה למנהל המערכת</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

---

### Part 3: Protected Route Component

Create `src/components/ProtectedRoute.jsx`:

```javascript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in, show the protected content
  return children;
};

export default ProtectedRoute;
```

---

### Part 4: Update App Router

Update `src/App.jsx`:

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route (public) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Route (protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### Part 5: Filter Students in Dashboard

Update your Dashboard component:

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../services/api';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndStudents();
  }, []);

  const loadUserAndStudents = async () => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('currentUser');

      if (!userStr) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr);
      setCurrentUser(user);

      // Fetch all students
      const allStudents = await API.getAllStudents();

      // Filter based on user role
      let filteredStudents;

      if (user.role === 'admin' || user.classes.includes('*')) {
        // Admin sees ALL students
        filteredStudents = allStudents;
      } else {
        // Teacher sees only their class students
        filteredStudents = allStudents.filter(student =>
          user.classes.includes(student.classId)
        );
      }

      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginTime');
    navigate('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header with user info */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">שלום {currentUser?.name}</h1>
            <p className="text-sm text-gray-600">
              כיתות: {currentUser?.classes.join(', ')} |
              תלמידים: {students.length}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            התנתק
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <div key={student.studentCode} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg">{student.name}</h3>
              <p className="text-gray-600">כיתה: {student.classId}</p>
              <p className="text-gray-600">קוד: {student.studentCode}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
```

---

## 📋 Setup Checklist

### 1. Create Teachers Sheet in Google Sheet

- [ ] Open your Google Sheet
- [ ] Add new sheet named "Teachers"
- [ ] Add headers: Email | Password | Name | Classes | Role
- [ ] Add at least one admin user with `*` for classes
- [ ] Add test teacher accounts

### 2. Update Google Apps Script

- [ ] Open Apps Script (Extensions → Apps Script)
- [ ] Add `authenticateUser()` function
- [ ] Update `doGet()` to handle login action
- [ ] Save and deploy new version
- [ ] Test: `YOUR_URL?action=login&email=test@test.com&password=test123`

### 3. Update React Frontend

- [ ] Install react-router-dom: `npm install react-router-dom`
- [ ] Create `LoginPage.jsx`
- [ ] Create `ProtectedRoute.jsx`
- [ ] Update `App.jsx` with routes
- [ ] Update Dashboard to filter students
- [ ] Add logout functionality

### 4. Test Everything

- [ ] Try logging in with wrong credentials (should show error)
- [ ] Login as teacher (should see only their classes)
- [ ] Login as admin (should see all students)
- [ ] Test logout
- [ ] Test protected routes (try accessing /dashboard without login)

---

## 🔒 Security Considerations

### Current Implementation (Pilot-Ready)

**Pros:**
- ✅ Simple and fast
- ✅ Good enough for pilot
- ✅ Easy to manage

**Cons:**
- ⚠️ Passwords in plain text in Google Sheet
- ⚠️ No password reset feature
- ⚠️ No brute-force protection
- ⚠️ Credentials sent as URL parameters

### Improvements for Production

**If moving to production:**

1. **Hash passwords** using bcrypt or similar
2. **Use POST requests** instead of GET for login
3. **Add rate limiting** to prevent brute force
4. **Add session expiry** (auto-logout after X hours)
5. **Add password reset** via email
6. **Add 2FA** for admins
7. **Consider Firebase Auth** for better security

---

## 🆘 Troubleshooting

### Issue: "Teachers sheet not found"

**Solution:** Make sure you created a sheet named exactly "Teachers" (case-sensitive)

---

### Issue: "Invalid credentials" even with correct password

**Solution:**
- Check for extra spaces in email or password
- Make sure sheet has correct column order: Email, Password, Name, Classes, Role
- Check Apps Script logs for errors

---

### Issue: Teacher sees all students instead of just their classes

**Solution:**
- Check that `classId` field matches in both students and teacher's classes
- Hebrew class names must match exactly (ז1 vs ז-1)
- Check filtering logic in Dashboard component

---

### Issue: Logout doesn't work

**Solution:**
```javascript
// Make sure logout clears localStorage
localStorage.removeItem('currentUser');
localStorage.removeItem('loginTime');
navigate('/login');
```

---

### Issue: Can't access /dashboard after login

**Solution:**
- Check that localStorage.setItem('currentUser', ...) is working
- Open browser DevTools → Application → Local Storage
- Should see 'currentUser' entry

---

## 🎯 Example Teachers Sheet

Here's a complete example for your pilot:

| Email | Password | Name | Classes | Role |
|-------|----------|------|---------|------|
| admin@school.com | Admin2024! | מנהל המערכת | * | admin |
| sarah.cohen@school.com | Sarah2024 | שרה כהן | ז1,ז2 | teacher |
| david.levi@school.com | David2024 | דוד לוי | ח1,ח2,ח3 | teacher |
| rachel.israel@school.com | Rachel2024 | רחל ישראל | ט1,ט2 | teacher |
| coordinator@school.com | Coord2024 | רכזת שכבה | ז1,ז2,ז3 | teacher |

**Testing accounts:**
- Admin sees: All 349 students
- Sarah sees: Students from ז1 + ז2 (~70 students)
- David sees: Students from ח1 + ח2 + ח3 (~120 students)
- Rachel sees: Students from ט1 + ט2 (~80 students)

---

## 📈 Upgrade Path

When you outgrow this simple system:

### Phase 1: Current (Pilot)
```
Google Sheets Auth → Good for 1-3 schools, up to 50 teachers
```

### Phase 2: Add Security (Growing)
```
Google Sheets + Hashed Passwords → Good for 3-5 schools
```

### Phase 3: Firebase Auth (Production)
```
Firebase Auth + Google Sheets Data → Good for 10+ schools
```

### Phase 4: Full Firebase (Scale)
```
Firebase Auth + Firestore Database → 100+ schools
```

---

## 💡 Quick Tips

1. **Start simple:** Don't overthink security for pilot
2. **Test with real teachers:** Get feedback early
3. **Keep admin password strong:** At least protect the admin account
4. **Document credentials:** Use password manager to store test accounts
5. **Plan upgrade path:** Know when to move to Firebase

---

## 📚 Related Documentation

- **Firebase Auth Guide:** `docs/TEACHER_AUTHENTICATION_GUIDE.md`
- **Firebase Migration:** `docs/FIREBASE_MIGRATION_CONSIDERATIONS.md`
- **Deployment:** `docs/DEPLOYMENT_GUIDE.md`
- **Multi-Tenant:** `docs/MULTI_TENANT_ARCHITECTURE.md`

---

## ✅ Summary

**Google Sheets Authentication = Simple Login System for Pilots**

1. Add Teachers sheet to your Google Sheet
2. Teacher logs in → Credentials checked against sheet
3. Dashboard filters students by teacher's classes
4. Admin sees all, teachers see only their students

**Perfect for:** Pilots, MVPs, 1-3 schools
**Upgrade when:** 5+ schools, need better security, moving to production

---

**Ready to implement? Let's get started!**
