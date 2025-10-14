# 🔧 Fix Google Apps Script Data Processing Issues

## The Problems Found

1. **Claude API Key**: The script is trying to call Claude API but likely the API key is not configured
2. **Student Names**: Showing as numbers (701) instead of actual names
3. **Error Handling**: When API fails, it writes "שגיאה בעיבוד" but doesn't show the actual error

## Step-by-Step Fix Instructions

### Step 1: Check Your Claude API Key

1. Open your Google Apps Script
2. Go to **Project Settings** (gear icon ⚙️ on left sidebar)
3. Scroll down to **Script Properties**
4. Check if you have a property named `CLAUDE_API_KEY`
   - If NOT: Click "Add property"
   - Property name: `CLAUDE_API_KEY`
   - Value: Your actual Claude API key from https://console.anthropic.com/

### Step 2: Add This Debug Version of doGet

Replace your current `doGet` function with this debug version that includes proper CORS headers:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId;

  try {
    // Test endpoint with debug info
    if (action === 'test') {
      // Check if API key exists
      const props = PropertiesService.getScriptProperties();
      const hasApiKey = props.getProperty('CLAUDE_API_KEY') !== null;

      return createJsonResponse({
        success: true,
        message: 'Connection successful! API v2.0 with CORS',
        timestamp: new Date().toISOString(),
        config: {
          formSheet: CONFIG.FORM_RESPONSES_SHEET,
          hasApiKey: hasApiKey,
          version: '2.0',
          corsEnabled: true
        }
      });
    }

    // Check rate limit for API-intensive actions
    if (['analyzeOneStudent', 'syncStudents', 'initialSync'].includes(action)) {
      if (!checkRateLimit()) {
        return createJsonResponse({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }
    }

    let result;

    switch(action) {
      case 'getAllStudents':
      case 'listStudents':  // Support both names
        result = getAllStudentsAPI();
        break;

      case 'getStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = getStudentAPI(studentId);
        break;

      case 'getAnalysisReport':
        result = getAnalysisReportAPI();
        break;

      case 'getStats':
        result = getStatsAPI();
        break;

      case 'analyzeOneStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = debugAnalyzeStudent(studentId);
        break;

      case 'smartAnalyze':
        result = smartAnalyzeStudents();
        break;

      case 'syncStudents':
        result = syncStudentsFromResponses();
        break;

      case 'initialSync':
        result = initialSyncAllStudents();
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: ['test', 'getAllStudents', 'getStudent', 'getStats', 'analyzeOneStudent', 'smartAnalyze', 'syncStudents', 'initialSync']
        };
    }

    return createJsonResponse(result);

  } catch (error) {
    return createJsonResponse({
      error: error.toString(),
      stack: error.stack,
      message: 'Server error occurred'
    });
  }
}

// CORS-enabled response
function createJsonResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // CORS headers
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  var output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);

  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    .setHeader('Access-Control-Max-Age', '3600');
}
```

### Step 3: Add Debug Version of Analyze Function

Add this debug version to see what's happening:

```javascript
function debugAnalyzeStudent(studentCode) {
  Logger.log(`[DEBUG] Starting analysis for student: ${studentCode}`);

  // Check API key first
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('CLAUDE_API_KEY');

  if (!apiKey) {
    Logger.log('[ERROR] No API key found in Script Properties!');
    return {
      success: false,
      error: 'API key not configured',
      solution: 'Add CLAUDE_API_KEY to Script Properties'
    };
  }

  // Get form responses
  const formResponses = getStudentFormResponses(studentCode);

  if (formResponses.length === 0) {
    Logger.log(`[ERROR] No form responses found for student ${studentCode}`);
    return {
      success: false,
      error: 'No form responses found',
      studentCode: studentCode
    };
  }

  Logger.log(`[DEBUG] Found ${formResponses.length} responses`);

  // Try to analyze
  try {
    const prompt = buildAnalysisPrompt(studentCode, formResponses);
    Logger.log('[DEBUG] Prompt built successfully');

    const analysis = callClaudeAPI(prompt);

    if (!analysis) {
      Logger.log('[ERROR] Claude API returned null');
      return {
        success: false,
        error: 'Claude API failed',
        hint: 'Check your API key and quota'
      };
    }

    Logger.log('[DEBUG] Analysis received from Claude');
    writeAnalysisToSheet(studentCode, analysis);

    return {
      success: true,
      message: 'Student analyzed successfully',
      studentCode: studentCode
    };

  } catch (error) {
    Logger.log(`[ERROR] ${error.toString()}`);
    return {
      success: false,
      error: error.toString(),
      studentCode: studentCode
    };
  }
}
```

### Step 4: Add Smart Analysis Function

Add this function to analyze students that need it:

```javascript
function smartAnalyzeStudents() {
  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const needsAnalysis = [];

  // Find students that need analysis
  uniqueStudents.forEach(code => {
    if (!analyzedStudents.has(code)) {
      needsAnalysis.push(code);
    }
  });

  Logger.log(`[Smart Analyze] Found ${needsAnalysis.length} students needing analysis`);

  if (needsAnalysis.length === 0) {
    return {
      success: true,
      message: 'All students already analyzed',
      analyzed: 0
    };
  }

  // Analyze up to 3 students (to avoid timeout)
  const toAnalyze = needsAnalysis.slice(0, 3);
  let successCount = 0;
  let errors = [];

  toAnalyze.forEach(studentCode => {
    try {
      const result = debugAnalyzeStudent(studentCode);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`${studentCode}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${studentCode}: ${error.toString()}`);
    }
  });

  return {
    success: true,
    analyzed: successCount,
    total: needsAnalysis.length,
    errors: errors.length > 0 ? errors : undefined,
    message: `Analyzed ${successCount} students. ${needsAnalysis.length - successCount} remaining.`
  };
}

function getAlreadyAnalyzedStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);
  const analyzed = new Set();

  if (!sheet || sheet.getLastRow() <= 1) {
    return analyzed;
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const studentCode = String(data[i][0]);
    // Only count as analyzed if not an error
    const learningStyle = data[i][5];
    if (studentCode && learningStyle !== 'שגיאה בעיבוד') {
      analyzed.add(studentCode);
    }
  }

  return analyzed;
}
```

### Step 5: Add Analysis Report Function

Add this to get analysis summary:

```javascript
function getAnalysisReportAPI() {
  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const needsAnalysis = [];

  uniqueStudents.forEach(code => {
    if (!analyzedStudents.has(code)) {
      needsAnalysis.push(code);
    }
  });

  return {
    summary: {
      total: uniqueStudents.length,
      upToDate: analyzedStudents.size,
      needAnalysis: needsAnalysis.length
    },
    needsAnalysis: needsAnalysis,
    lastUpdated: new Date().toISOString()
  };
}
```

### Step 6: Fix getAllStudentsAPI

Update the function to handle errors better:

```javascript
function getAllStudentsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    // Return empty but with proper structure
    return {
      students: [],
      total: 0
    };
  }

  const data = sheet.getDataRange().getValues();
  const students = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const studentCode = row[0];
    const quarter = row[1] || 'Q1';
    const classId = row[2] || 'Unknown';
    const date = row[3];
    const name = row[4] || `Student ${studentCode}`; // Fixed: use English fallback
    const learningStyle = row[5] || '';
    const keyNotes = row[6] || '';
    const strengthsText = row[7] || '';
    const challengesText = row[8] || '';

    // Skip error entries if you want
    if (learningStyle === 'שגיאה בעיבוד') {
      // Still include but mark as needs analysis
      students.push({
        studentCode: studentCode,
        quarter: quarter,
        classId: classId,
        date: formatDate(date),
        name: name,
        learningStyle: 'Needs Analysis',
        keyNotes: 'Student needs to be analyzed',
        strengthsCount: 0,
        challengesCount: 0,
        needsAnalysis: true
      });
    } else {
      const strengths = strengthsText.split('\n').filter(s => s.trim()).length;
      const challenges = challengesText.split('\n').filter(s => s.trim()).length;

      students.push({
        studentCode: studentCode,
        quarter: quarter,
        classId: classId,
        date: formatDate(date),
        name: name,
        learningStyle: learningStyle,
        keyNotes: keyNotes,
        strengthsCount: strengths,
        challengesCount: challenges,
        needsAnalysis: false
      });
    }
  }

  return {
    students: students,
    total: students.length
  };
}
```

## Testing Your Fixes

### 1. Test API Key Configuration
In Google Apps Script, run this function:
```javascript
function testApiKey() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('CLAUDE_API_KEY');

  if (!apiKey) {
    Logger.log('❌ No API key found!');
    Logger.log('➡️ Add CLAUDE_API_KEY to Script Properties');
  } else {
    Logger.log('✅ API key found');
    Logger.log('Length: ' + apiKey.length + ' characters');
    Logger.log('Starts with: ' + apiKey.substring(0, 10) + '...');
  }
}
```

### 2. Test Analysis with Debug
Run this to test with detailed logging:
```javascript
function testAnalysisDebug() {
  const students = getUniqueStudents();
  if (students.length > 0) {
    const result = debugAnalyzeStudent(students[0]);
    Logger.log('Result: ' + JSON.stringify(result, null, 2));
  }
}
```

### 3. Deploy and Test
1. Save all changes (Ctrl+S)
2. Deploy → New deployment
3. Type: Web app
4. Description: "V6 - Fixed Data Processing"
5. Execute as: Me
6. Who has access: Anyone
7. Deploy and copy URL

## What This Fixes

1. ✅ **Better Error Messages**: Shows exactly what's wrong
2. ✅ **API Key Check**: Verifies API key is configured
3. ✅ **Smart Analysis**: Only analyzes students that need it
4. ✅ **Proper Names**: Falls back to "Student 123" instead of just numbers
5. ✅ **CORS Headers**: Properly configured for all endpoints
6. ✅ **Debug Info**: Detailed logging to identify issues

## Next Steps

1. Add your Claude API key to Script Properties
2. Update the code with these fixes
3. Deploy as V6
4. Test with your dashboard
5. Use the "AI חכם" button to analyze students

Let me know when you've added the API key and I'll help you test!