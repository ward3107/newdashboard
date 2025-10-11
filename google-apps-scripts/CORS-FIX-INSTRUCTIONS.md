# 🚨 CRITICAL: Google Apps Script CORS Fix Instructions

## The Problem
Your V4 deployment is STILL not sending CORS headers. This is why you're getting errors.

## EXACT Steps to Fix (MUST FOLLOW EXACTLY)

### Step 1: Open Your Google Apps Script
1. Go to your Google Apps Script project
2. Find the file with your code (usually `Code.gs`)

### Step 2: REPLACE Your Functions With These EXACT Versions

#### REPLACE the `createJsonResponse` function:
```javascript
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // CORS headers - THESE ARE CRITICAL!
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}
```

#### ADD this NEW function (if it doesn't exist):
```javascript
function doOptions(e) {
  var output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);

  // CORS headers for OPTIONS requests
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}
```

#### MODIFY your `doGet` function:
Make sure EVERY return statement in `doGet` uses `createJsonResponse()`.

Example:
```javascript
function doGet(e) {
  var action = e.parameter.action;

  // Handle OPTIONS request (preflight)
  if (!action) {
    return createJsonResponse({
      status: 'ready',
      message: 'API is working',
      timestamp: new Date().toISOString()
    });
  }

  try {
    switch(action) {
      case 'test':
        return createJsonResponse({
          success: true,
          message: 'CORS is working!'
        });

      case 'listStudents':
        // Your existing code...
        return createJsonResponse(result);

      case 'getAllStudents':
        // Your existing code...
        return createJsonResponse(result);

      case 'getAnalysisReport':
        // Your existing code...
        return createJsonResponse(result);

      default:
        return createJsonResponse({
          error: 'Unknown action: ' + action
        });
    }
  } catch(error) {
    return createJsonResponse({
      error: error.toString()
    });
  }
}
```

### Step 3: SAVE Your Script
1. Press `Ctrl + S` (or `Cmd + S` on Mac)
2. Wait for "Saved" message to appear

### Step 4: Deploy NEW Version (V5)
1. Click **Deploy** button (top right)
2. Click **New deployment**
3. Click the gear icon ⚙️ next to "Select type"
4. Choose **Web app**
5. Fill in:
   - **Description**: "V5 - CORS Headers Fixed"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
6. Click **Deploy**
7. **COPY THE NEW URL** (it will start with `https://script.google.com/macros/s/...`)

### Step 5: Test With HTML File
1. Open the test file: `C:\Users\Waseem\Downloads\student-dashboard-fixed\test-api.html`
2. I'll update it with your V5 URL once you provide it
3. Open in browser and click "Run Test"
4. If it says "SUCCESS!" then CORS is working

## ⚠️ Common Mistakes to Avoid
1. **DON'T** forget to SAVE before deploying
2. **DON'T** update existing deployment - create NEW deployment
3. **DON'T** forget to copy the new URL
4. **MAKE SURE** every `return` in `doGet` uses `createJsonResponse()`
5. **MAKE SURE** you have the `doOptions` function

## 🔍 How to Verify CORS Headers Are Working
When you test with the HTML file, if CORS is working you'll see:
- SUCCESS message
- JSON data in the response
- NO red error messages in browser console

## Need Help?
If V5 still doesn't work:
1. Double-check that you SAVED the script
2. Make sure you created a NEW deployment (not updated existing)
3. Verify the URL is different from V4
4. Check that ALL return statements use `createJsonResponse()`

---

Once you have the V5 URL, paste it here and I'll update everything!