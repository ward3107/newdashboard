# ISHEBOT User Guide

## For Teachers & Administrators

### 📌 Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Students](#managing-students)
4. [Student Assessments](#student-assessments)
5. [Classroom Optimization](#classroom-optimization)
6. [Reports & Export](#reports--export)
7. [Settings](#settings)
8. [Troubleshooting](#troubleshooting)

---

## 1. Getting Started

### First Login

1. Navigate to your ISHEBOT dashboard URL (provided by administrator)
2. Click **"Sign In"**
3. Choose login method:
   - **Email & Password**: Enter your school email and password
   - **Google Sign-In**: Use your Google account (if enabled)

4. After first login, you may be asked to verify your email

### Dashboard Access

After logging in, you'll see:
- **Teacher Dashboard**: Overview of all your students
- **Class Analytics**: Performance metrics by class
- **Quick Actions**: Common tasks and shortcuts

---

## 2. Dashboard Overview

### Main Components

**🏠 Overview Section**
- Total students count
- Students analyzed this week
- Average strengths score
- Up-to-date vs needs analysis

**📊 Analytics Cards**
- Learning styles distribution (Visual, Auditory, Kinesthetic, etc.)
- Class sizes breakdown
- Recent activity timeline

**🔍 Student List**
- View all students in grid or list format
- Filter by class, learning style, or status
- Search by name or student code

### Theme Customization

Click the **🎨 Theme** button to choose from:
- Default (Blue/Purple gradient)
- Sunset (Orange/Red)
- Ocean (Blue/Teal)
- Forest (Green)
- Royal (Purple)

Toggle **Dark Mode** for comfortable viewing in low light.

---

## 3. Managing Students

### Viewing Student Details

1. Click on any **student card** in the dashboard
2. You'll see:
   - **Student Summary**: Learning style, key notes
   - **Insights**: AI-generated observations by category
   - **Recommendations**: Actionable teaching strategies
   - **Immediate Actions**: Priority interventions
   - **Seating Arrangement**: Optimal classroom placement

### Understanding Insights

Each insight includes:
- **Category**: Academic Performance, Social Behavior, Emotional Well-being, etc.
- **Finding**: What the AI observed
- **Recommendations**: Specific actions you can take
- **Priority**: Low/Medium/High urgency

### Student Avatars

Avatars are auto-generated based on:
- Student code (for consistency)
- Learning style (colors)
- Visual indicators for needs/attention

---

## 4. Student Assessments

### Assessment Form (For Students)

**URL**: `https://yourdomain.com/assessment`

**How Students Fill It Out:**

1. **Select Language**
   - Hebrew (עברית) - Default
   - English
   - Arabic (العربية)
   - Russian (Русский)

2. **Basic Information**
   - Student Code (5 digits)
   - Full Name
   - Class (e.g., י1 = Grade 10, Class 1)

3. **Answer Questions**
   - 30+ questions across multiple domains:
     - Academic interests
     - Learning preferences
     - Social behavior
     - Emotional state
     - Study habits
   - Progress bar shows completion %
   - Encouraging messages at milestones

4. **Submit**
   - Form auto-saves progress
   - Data encrypted before sending
   - Success confirmation with confetti! 🎉

### Privacy & Security

Students are informed:
- ✅ Data is encrypted
- ✅ Only teachers can see results
- ✅ Used only for educational purposes
- ✅ Stored securely in Firebase

### Form Features

- **Auto-save**: Progress saved every few seconds
- **Crash Recovery**: Resume if browser closes
- **Offline Support**: Submit when connection returns
- **Keyboard Shortcuts**:
  - `1-5`: Select answer
  - `Ctrl+Enter`: Submit form
  - `Ctrl+→`: Next question
  - `Ctrl+←`: Previous question

---

## 5. Classroom Optimization

### AI Seating Arrangement

**Access**: Dashboard → Student Details → "Seating Arrangement" section

**How It Works:**
1. AI analyzes each student's:
   - Learning style
   - Academic level
   - Behavioral patterns
   - Social preferences
   - Special needs

2. Generates optimal seating based on:
   - ✅ Minimize distractions
   - ✅ Maximize collaboration potential
   - ✅ Balance class dynamics
   - ✅ Support struggling students
   - ✅ Respect special accommodations

**Seating Recommendations Include:**
- **Location**: Front/Middle/Back of class
- **Partner Type**: Who to sit with (High achiever, Peer mentor, etc.)
- **Avoid**: Students who may distract each other

### Classroom Optimization Page

**Access**: Dashboard → "Classroom Optimization" menu

**Advanced Features:**
- Upload entire class roster
- Set classroom layout (rows, groups, etc.)
- Run genetic algorithm optimization
- Export seating chart as PDF/Excel

---

## 6. Reports & Export

### Export Student Data

1. Click **"Export"** button in dashboard
2. Choose format:
   - **Excel (.xlsx)**: Full data with formulas
   - **CSV**: Simple comma-separated values
   - **PDF**: Printable report

### What's Included:
- Student code, name, class
- Learning style
- Key strengths
- Challenges
- Last analysis date
- Recommendation summary

### Smart Analysis

Click **"Run Smart Analysis"** to:
- Refresh all student insights
- Generate new recommendations
- Update seating arrangements
- Detect pattern changes

**Note**: This uses AI credits, so use thoughtfully.

---

## 7. Settings

### Change Language

- Click **language selector** in top navigation
- Affects:
  - UI labels and buttons
  - Date formats
  - Number formats
- Does NOT change student assessment data

### Dark Mode

- Toggle in theme selector
- Preference saved locally
- Reduces eye strain in low light

### Notifications

- Enable browser notifications for:
  - New student submissions
  - Analysis completion
  - System updates

---

## 8. Troubleshooting

### Common Issues

**❌ "Permission denied" errors**

**Problem**: Can't access student data
**Solution**:
1. Ensure you're logged in
2. Check you have teacher/admin role
3. Contact administrator if persists

---

**❌ "Firebase not configured"**

**Problem**: Orange warning banner
**Solution**:
- This is a setup issue - contact your IT administrator
- The app needs Firebase configuration to work

---

**❌ Student assessment form won't submit**

**Problem**: "Submission failed" error
**Solution**:
1. Check internet connection
2. Data is saved locally - try again when online
3. Check all required fields are filled

---

**❌ Dashboard loading forever**

**Problem**: Spinning loader never finishes
**Solution**:
1. Refresh page (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Try different browser
4. Contact support if persists

---

### Keyboard Shortcuts

**Dashboard:**
- `/` - Focus search
- `Esc` - Clear search / Close modals
- `Ctrl+E` - Export data
- `Ctrl+N` - New analysis

**Student Detail:**
- `Esc` - Go back to dashboard
- `Ctrl+P` - Print student report

---

### Browser Compatibility

**Recommended Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Mobile Support:**
- ✅ iOS Safari (iPad, iPhone)
- ✅ Chrome for Android
- ✅ Responsive design adapts to screen size

---

### Data Backup & Recovery

**Where is data stored?**
- Cloud: Firebase Firestore (Google Cloud)
- Backup: Automated daily backups
- Location: Your Firebase project region

**How to recover deleted data:**
Contact your administrator - Firebase retains deleted data for 30 days.

**Exporting for backup:**
Regularly export your student data using the Export feature.

---

## 🆘 Getting Help

**For technical issues:**
- Email: wardwas3107@gmail.com
- Include:
  - Error message (screenshot)
  - What you were trying to do
  - Browser and OS version

**For feature requests:**
- Submit via feedback form (if available)
- Or email with "Feature Request" in subject

**For urgent issues:**
- Use emergency contact provided by administrator
- Include school name and user email

---

## 📖 Additional Resources

- [Firebase Setup Guide](docs/FIREBASE_SETUP_GUIDE.md) (For administrators)
- [Security Setup](docs/FIREBASE_SECURITY_SETUP.md) (For administrators)
- [Privacy Policy](/privacy-policy)
- [Terms of Service](/terms)

---

**Last Updated**: January 2025
**Version**: 1.0.1
