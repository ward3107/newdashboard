# 🔐 Teacher Authentication & Authorization Guide

## Overview

Implement a system where each teacher logs in and sees **only their students**.

---

## 🎯 Architecture Options

### Option 1: Firebase Authentication (RECOMMENDED)

**Best for:**
- Production deployments
- Multiple schools
- Scalability
- Security

**Features:**
- ✅ Email/password login
- ✅ Google Sign-In (great for schools)
- ✅ Password reset
- ✅ Session management
- ✅ Role-based access (admin, teacher, viewer)
- ✅ FREE for most use cases

---

### Option 2: Google Sheets + Simple Auth

**Best for:**
- Quick MVP
- Single school
- Minimal setup
- Current architecture (already using Google Sheets)

**Features:**
- ✅ Teacher list in Google Sheet
- ✅ Simple password login
- ✅ Class assignments
- ⚠️ Less secure (passwords in sheet)
- ⚠️ No built-in password reset

---

### Option 3: Custom Backend Auth

**Best for:**
- Full control
- Custom requirements
- Enterprise features

**Requires:**
- Backend server (Node.js/Express)
- Database (PostgreSQL/MongoDB)
- JWT tokens
- More development time

---

## 🚀 Implementation: Firebase Auth (Recommended)

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it: "ISHEBOT Dashboard"
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console → Authentication
2. Click "Get started"
3. Enable sign-in methods:
   - **Email/Password** ✅ (Enable)
   - **Google** ✅ (Enable - great for teachers)
4. Click "Save"

### Step 3: Add Firebase to Your App

```bash
npm install firebase
```

### Step 4: Get Firebase Config

1. Project Settings (gear icon) → General
2. Scroll to "Your apps"
3. Click "Web" (</> icon)
4. Register app: "ISHEBOT Dashboard"
5. Copy the config object

### Step 5: Create Firebase Config File

Create `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
```

### Step 6: Add Firebase Env Vars

In `.env`:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ishebot-dashboard.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ishebot-dashboard
VITE_FIREBASE_STORAGE_BUCKET=ishebot-dashboard.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 7: Create Auth Context

Create `src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const profile = profileDoc.data();

        setUser(firebaseUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login with email/password
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const loginWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Logout
  const logout = async () => {
    return signOut(auth);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  // Check if user is teacher
  const isTeacher = () => {
    return userProfile?.role === 'teacher';
  };

  // Get teacher's classes
  const getTeacherClasses = () => {
    return userProfile?.classes || [];
  };

  const value = {
    user,
    userProfile,
    login,
    loginWithGoogle,
    logout,
    isAdmin,
    isTeacher,
    getTeacherClasses,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### Step 8: Create Login Page

Create `src/components/LoginPage.jsx`:

```javascript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('שגיאה בהתחברות עם Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ISHEBOT Dashboard
          </h1>
          <p className="text-gray-600">התחברות למורים</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">או</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            התחבר עם Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Step 9: Create Protected Route

Create `src/components/ProtectedRoute.jsx`:

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && userProfile?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
```

### Step 10: Update App.jsx with Routes

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 11: Filter Students by Teacher

Update your Dashboard component to filter students:

```javascript
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import * as API from '../services/api';

const Dashboard = () => {
  const { userProfile, isAdmin, isTeacher, getTeacherClasses } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const allStudents = await API.getAllStudents();

      // Filter students based on role
      if (isAdmin()) {
        // Admin sees all students
        setStudents(allStudents);
      } else if (isTeacher()) {
        // Teacher sees only their class students
        const teacherClasses = getTeacherClasses();
        const filtered = allStudents.filter(student =>
          teacherClasses.includes(student.classId)
        );
        setStudents(filtered);
      }
    };

    fetchStudents();
  }, [userProfile]);

  // ... rest of component
};
```

---

## 📊 Firestore User Structure

Create users in Firestore with this structure:

```javascript
// Collection: users
// Document ID: {userId} (from Firebase Auth)

{
  uid: "abc123...",
  email: "teacher@school.com",
  displayName: "Sarah Cohen",
  role: "teacher", // "admin" | "teacher" | "viewer"
  classes: ["ז1", "ז2"], // Which classes this teacher teaches
  schoolId: "school-einstein", // For multi-tenant
  permissions: {
    viewStudents: true,
    editStudents: false,
    deleteStudents: false,
    viewReports: true,
    exportData: true
  },
  createdAt: timestamp,
  lastLogin: timestamp
}
```

---

## 👥 Creating Teacher Accounts

### Method 1: Firebase Console (Manual)

1. Firebase Console → Authentication
2. Click "Add user"
3. Enter email & password
4. Go to Firestore → users collection
5. Create document with user's UID
6. Add profile data (role, classes, etc.)

### Method 2: Admin Panel (Automated)

Create an admin interface in your dashboard:

```javascript
// src/components/AdminUserManagement.jsx

const AdminUserManagement = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('teacher');
  const [classes, setClasses] = useState([]);

  const createUser = async () => {
    try {
      // Create auth user via Cloud Function
      const result = await fetch('https://your-cloud-function-url/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          role,
          classes
        })
      });

      alert('משתמש נוצר בהצלחה!');
    } catch (error) {
      alert('שגיאה ביצירת משתמש');
    }
  };

  // ... UI for creating users
};
```

---

## 🔄 Alternative: Simple Google Sheets Auth

If you want a quick MVP without Firebase:

### Step 1: Create Teachers Sheet

In your Google Sheet, add a new sheet called "Teachers":

```
| Email                  | Password | Name          | Classes    | Role    |
|------------------------|----------|---------------|------------|---------|
| sarah@school.com       | pass123  | Sarah Cohen   | ז1,ז2      | teacher |
| david@school.com       | pass456  | David Levi    | ח1,ח2      | teacher |
| admin@school.com       | admin    | Admin         | *          | admin   |
```

### Step 2: Update Google Apps Script

Add to your `COMPLETE_INTEGRATED_SCRIPT_OPENAI.js`:

```javascript
function authenticateUser(email, password) {
  const teachersSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Teachers');

  const data = teachersSheet.getDataRange().getValues();

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const [emailCol, passCol, nameCol, classesCol, roleCol] = data[i];

    if (emailCol === email && passCol === password) {
      return {
        success: true,
        user: {
          email: emailCol,
          name: nameCol,
          classes: classesCol.split(',').map(c => c.trim()),
          role: roleCol
        }
      };
    }
  }

  return { success: false, error: 'Invalid credentials' };
}

// Add to doGet function
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'login') {
    const email = e.parameter.email;
    const password = e.parameter.password;
    return ContentService.createTextOutput(
      JSON.stringify(authenticateUser(email, password))
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // ... existing actions
}
```

### Step 3: Update Frontend Login

```javascript
const login = async (email, password) => {
  const response = await fetch(
    `${API_URL}?action=login&email=${email}&password=${password}`
  );
  const result = await response.json();

  if (result.success) {
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(result.user));
    navigate('/dashboard');
  } else {
    setError('Invalid credentials');
  }
};
```

---

## 🎯 Summary: Which Method?

| Feature | Firebase Auth | Google Sheets Auth |
|---------|---------------|-------------------|
| **Security** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Setup Time** | 2-3 hours | 30 minutes |
| **Password Reset** | Built-in | Manual |
| **Google Sign-In** | Yes | No |
| **Scalability** | Excellent | Limited |
| **Cost** | FREE | FREE |
| **Best For** | Production | Quick MVP |

---

## 🚀 Recommended Path

1. **Start with Simple (Google Sheets)** - Get it working quickly
2. **Migrate to Firebase** - When you need security & features
3. **Add Firestore** - When you outgrow Google Sheets

---

## 📝 Next Steps

1. Choose authentication method
2. Implement login page
3. Create teacher accounts
4. Test role-based access
5. Add password reset feature
6. Deploy to production

Need help implementing? Let me know which approach you prefer!
