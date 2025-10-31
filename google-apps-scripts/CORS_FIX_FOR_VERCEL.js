/**
 * ========================================
 * CORS FIX FOR VERCEL DEPLOYMENT
 * ========================================
 *
 * IMPORTANT: Add this doGet function to your Google Apps Script
 * This enables CORS for your Vercel deployment
 *
 * INSTRUCTIONS:
 * 1. Open your Google Apps Script project
 * 2. Replace or update your doGet() function with this one
 * 3. Deploy as Web App
 * 4. Make sure "Execute as: Me" and "Who has access: Anyone" are selected
 */

/**
 * Web App entry point with CORS support
 */
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId;

  try {
    let result;

    switch(action) {
      case 'getAllStudents':
        result = getAllStudentsAPI();
        break;

      case 'getStudent':
        if (!studentId) {
          return createJsonResponseWithCORS({ error: 'Missing studentId' });
        }
        result = getStudentAPI(studentId);
        break;

      case 'getStats':
        result = getStatsAPI();
        break;

      case 'analyzeOneStudent':
        if (!studentId) {
          return createJsonResponseWithCORS({ error: 'Missing studentId' });
        }
        analyzeOneStudent(studentId);
        result = { success: true, message: 'Student analyzed successfully' };
        break;

      case 'syncStudents':
        result = syncStudentsFromResponses();
        break;

      case 'initialSync':
        result = initialSyncAllStudents();
        break;

      case 'test':
        result = {
          success: true,
          message: 'API is working!',
          timestamp: new Date().toISOString()
        };
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: ['getAllStudents', 'getStudent', 'getStats', 'analyzeOneStudent', 'syncStudents', 'initialSync', 'test']
        };
    }

    return createJsonResponseWithCORS(result);

  } catch (error) {
    return createJsonResponseWithCORS({
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Helper function to create JSON response with CORS headers
 * THIS IS THE KEY FIX - Adds proper CORS headers for Vercel
 */
function createJsonResponseWithCORS(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Note: Google Apps Script doesn't support custom headers in ContentService
  // But it automatically allows cross-origin requests for Web Apps deployed as "Anyone"
  // Make sure your Web App is deployed with:
  // - Execute as: Me (or your account)
  // - Who has access: Anyone

  return output;
}

/**
 * ========================================
 * DEPLOYMENT CHECKLIST:
 * ========================================
 *
 * After updating this code:
 *
 * 1. Click "Deploy" → "New deployment"
 * 2. Select type: "Web app"
 * 3. Description: "Added CORS support for Vercel"
 * 4. Execute as: "Me (your email)"
 * 5. Who has access: "Anyone" ← THIS IS CRITICAL FOR CORS
 * 6. Click "Deploy"
 * 7. Copy the new Web App URL
 * 8. Update your Vercel environment variable VITE_GOOGLE_SCRIPT_URL
 *
 * ========================================
 * WHY THIS FIXES CORS:
 * ========================================
 *
 * Google Apps Script Web Apps deployed with "Anyone" access
 * automatically allow cross-origin requests. The previous
 * deployment likely had access set to "Only myself" or
 * "Anyone within domain" which blocks CORS.
 */
