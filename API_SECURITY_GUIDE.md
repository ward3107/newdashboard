# 🔐 Complete API Security Guide

## 🎯 The Problem

Putting your API key directly in the script is **NOT SECURE** because:
- Anyone with script access can see it
- It's visible in version history
- If someone gets your sheet link, they might access the script

## ✅ Solution: Use Google Apps Script Properties Service

This is the **most secure method** for Google Apps Script:

### Method 1: Script Properties (RECOMMENDED)

Your API key is stored **encrypted** by Google and **NOT visible** in the code.

#### Step 1: Store the API Key Securely

1. Open your Google Apps Script
2. Click on **Project Settings** (⚙️ gear icon on left)
3. Scroll down to **Script Properties**
4. Click **Add script property**
5. Property name: `CLAUDE_API_KEY`
6. Value: `your-actual-api-key-here`
7. Click **Save**

#### Step 2: Update Your Script

Replace the CONFIG section with this:

```javascript
// ========================================
// SECURE CONFIGURATION
// ========================================
const CONFIG = {
  // Sheet names
  FORM_RESPONSES_SHEET: 'StudentResponses',
  AI_INSIGHTS_SHEET: 'AI_Insights',
  STUDENTS_SHEET: 'students',

  // Claude API - Retrieved securely from Script Properties
  get CLAUDE_API_KEY() {
    return PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  },
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',

  // Column indexes...
  COLUMNS: {
    TIMESTAMP: 0,
    STUDENT_CODE: 2,
    CLASS_ID: 3,
    // ... rest of your columns
  }
};
```

**Benefits:**
- ✅ API key is **encrypted** by Google
- ✅ **NOT visible** in code
- ✅ **NOT visible** in version history
- ✅ Only accessible by the script owner
- ✅ Can be changed without editing code

---

## 🔒 Additional Security Layers

### Method 2: User Properties (Per-User Keys)

If multiple people use the script with different API keys:

```javascript
const CONFIG = {
  get CLAUDE_API_KEY() {
    return PropertiesService.getUserProperties().getProperty('CLAUDE_API_KEY');
  }
};
```

### Method 3: IP Restrictions (Claude API Level)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to your API key settings
3. Restrict API key to specific IP addresses or domains
4. Add your Google Apps Script IP ranges

### Method 4: Rate Limiting

Add rate limiting to prevent abuse:

```javascript
function callClaudeAPI(prompt) {
  const cache = CacheService.getScriptCache();
  const rateLimitKey = 'api_calls_' + new Date().toDateString();

  // Get current call count
  let callCount = parseInt(cache.get(rateLimitKey) || '0');

  // Limit to 100 calls per day
  if (callCount >= 100) {
    Logger.log('Rate limit exceeded');
    return null;
  }

  // Increment counter
  cache.put(rateLimitKey, String(callCount + 1), 86400); // 24 hours

  // Rest of your API call code...
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');

  if (!apiKey) {
    Logger.log('ERROR: API key not configured in Script Properties');
    return null;
  }

  // Make API call...
}
```

### Method 5: Access Control for Web App

When deploying, restrict access:

```javascript
function doGet(e) {
  // Whitelist specific users/emails
  const authorizedEmails = [
    'your-email@domain.com',
    'teacher@school.com'
  ];

  const userEmail = Session.getActiveUser().getEmail();

  if (!authorizedEmails.includes(userEmail)) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Unauthorized access'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Rest of your doGet code...
}
```

### Method 6: API Key Rotation

Regularly rotate your API keys:

```javascript
// Function to rotate API key
function rotateAPIKey() {
  const props = PropertiesService.getScriptProperties();
  const oldKey = props.getProperty('CLAUDE_API_KEY');

  // Store old key as backup
  props.setProperty('CLAUDE_API_KEY_OLD', oldKey);

  // Set new key (you'd input this manually)
  props.setProperty('CLAUDE_API_KEY', 'new-key-here');

  Logger.log('API key rotated successfully');
}
```

---

## 🛡️ Complete Secure Implementation

Here's the fully secured version of your script:

```javascript
// ========================================
// ULTRA-SECURE CONFIGURATION
// ========================================
const CONFIG = {
  FORM_RESPONSES_SHEET: 'StudentResponses',
  AI_INSIGHTS_SHEET: 'AI_Insights',
  STUDENTS_SHEET: 'students',

  // Secure API key retrieval
  get CLAUDE_API_KEY() {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty('CLAUDE_API_KEY');

    if (!key) {
      throw new Error('API key not configured. Add it to Script Properties.');
    }

    return key;
  },

  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',

  // Rate limits
  MAX_CALLS_PER_DAY: 100,
  MAX_CALLS_PER_HOUR: 20,

  COLUMNS: {
    TIMESTAMP: 0,
    SCHOOL_CODE: 1,
    STUDENT_CODE: 2,
    CLASS_ID: 3,
    GENDER: 4,
    // ... rest
  }
};

// ========================================
// SECURE WEB APP ENTRY POINT
// ========================================
function doGet(e) {
  try {
    // Optional: Check authorization
    if (!isAuthorized()) {
      return createJsonResponse({
        error: 'Unauthorized',
        message: 'Access denied'
      });
    }

    // Check rate limit
    if (!checkRateLimit()) {
      return createJsonResponse({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Try again later.'
      });
    }

    const action = e.parameter.action;
    const studentId = e.parameter.studentId;

    let result;

    switch(action) {
      case 'getAllStudents':
        result = getAllStudentsAPI();
        break;

      case 'getStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = getStudentAPI(studentId);
        break;

      case 'analyzeOneStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        analyzeOneStudent(studentId);
        result = { success: true, message: 'Analysis started' };
        break;

      // ... other cases

      default:
        result = { error: 'Invalid action' };
    }

    return createJsonResponse(result);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createJsonResponse({
      error: 'Internal server error',
      message: 'An error occurred. Please contact administrator.'
    });
  }
}

// ========================================
// SECURITY FUNCTIONS
// ========================================

function isAuthorized() {
  // Method 1: Check user email
  const userEmail = Session.getEffectiveUser().getEmail();
  const allowedDomains = ['yourschool.com', 'yourdomain.com'];

  const domain = userEmail.split('@')[1];
  return allowedDomains.includes(domain);

  // OR Method 2: Check specific users
  // const allowedUsers = ['teacher1@school.com', 'teacher2@school.com'];
  // return allowedUsers.includes(userEmail);

  // OR Method 3: Allow all (least secure)
  // return true;
}

function checkRateLimit() {
  const cache = CacheService.getScriptCache();
  const now = new Date();

  // Daily limit
  const dailyKey = 'daily_' + now.toDateString();
  const dailyCount = parseInt(cache.get(dailyKey) || '0');

  if (dailyCount >= CONFIG.MAX_CALLS_PER_DAY) {
    return false;
  }

  // Hourly limit
  const hourlyKey = 'hourly_' + now.toDateString() + '_' + now.getHours();
  const hourlyCount = parseInt(cache.get(hourlyKey) || '0');

  if (hourlyCount >= CONFIG.MAX_CALLS_PER_HOUR) {
    return false;
  }

  // Increment counters
  cache.put(dailyKey, String(dailyCount + 1), 86400); // 24 hours
  cache.put(hourlyKey, String(hourlyCount + 1), 3600); // 1 hour

  return true;
}

function callClaudeAPI(prompt) {
  // Get API key securely
  let apiKey;
  try {
    apiKey = CONFIG.CLAUDE_API_KEY;
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return null;
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: CONFIG.CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log('API Error: ' + statusCode + ' - ' + response.getContentText());
      return null;
    }

    const result = JSON.parse(response.getContentText());

    if (result.content && result.content[0]) {
      return result.content[0].text;
    }

    return null;

  } catch (error) {
    Logger.log('Claude API Error: ' + error.toString());
    return null;
  }
}

// ========================================
// MONITORING & LOGGING
// ========================================

function logAPIUsage(action, studentId, success) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('API_Logs');

  if (!sheet) {
    // Create logging sheet if it doesn't exist
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.insertSheet('API_Logs');
    logSheet.appendRow(['Timestamp', 'User', 'Action', 'Student ID', 'Success', 'IP']);
  }

  const user = Session.getEffectiveUser().getEmail();
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    user,
    action,
    studentId || 'N/A',
    success ? 'Yes' : 'No',
    'N/A' // Google Apps Script doesn't expose IP
  ]);
}
```

---

## 🔑 Setup Instructions

### Step-by-Step Secure Setup:

1. **Open Google Apps Script**
   - Extensions > Apps Script

2. **Add API Key to Script Properties** (NEVER in code!)
   - Click ⚙️ Project Settings
   - Scroll to "Script Properties"
   - Add property: `CLAUDE_API_KEY` = `your-key-here`

3. **Update Your Script**
   - Replace CONFIG section with secure version above

4. **Set Up Rate Limiting** (Optional)
   - Adjust `MAX_CALLS_PER_DAY` and `MAX_CALLS_PER_HOUR`

5. **Configure Access Control** (Optional)
   - Update `isAuthorized()` function with your allowed users/domains

6. **Deploy Web App**
   - Deploy > New Deployment
   - Execute as: **Me** (important!)
   - Who has access: **Only myself** or **Anyone with Google account**

7. **Create Monitoring Sheet** (Optional)
   - Manually create "API_Logs" sheet for tracking

---

## 📊 Security Checklist

- [ ] API key stored in Script Properties (NOT in code)
- [ ] Rate limiting enabled
- [ ] Access control configured
- [ ] Web App deployed with "Execute as: Me"
- [ ] Error logging enabled
- [ ] Regular API key rotation scheduled
- [ ] Monitoring sheet created
- [ ] No sensitive data in logs

---

## 🚨 What NOT to Do

❌ **NEVER** put API key directly in code:
```javascript
const API_KEY = 'sk-ant-api03-xxxxx'; // BAD!
```

❌ **NEVER** commit API keys to Git/GitHub

❌ **NEVER** share your Apps Script with API key in it

❌ **NEVER** log the API key:
```javascript
Logger.log(apiKey); // BAD!
```

❌ **NEVER** return API key in responses:
```javascript
return { apiKey: CONFIG.CLAUDE_API_KEY }; // BAD!
```

---

## ✅ What TO Do

✅ **ALWAYS** use Script Properties

✅ **ALWAYS** use try-catch blocks

✅ **ALWAYS** implement rate limiting

✅ **ALWAYS** validate input

✅ **ALWAYS** log errors (not sensitive data)

✅ **ALWAYS** rotate keys regularly (monthly)

---

## 🔐 Maximum Security Configuration

For **absolute maximum security**, use ALL these together:

1. ✅ Script Properties for API key
2. ✅ Rate limiting (per hour + per day)
3. ✅ Email/domain whitelist
4. ✅ Error logging (without sensitive data)
5. ✅ Web App deployed as "Execute as: Me"
6. ✅ Regular API key rotation
7. ✅ Monitor usage with API_Logs sheet
8. ✅ Set API budget limits in Anthropic Console

This makes your API key **virtually impossible** to steal or abuse! 🛡️
