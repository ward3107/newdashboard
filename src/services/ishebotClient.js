/**
 * ISHEBOT WebApp Client
 * Calls GAS doGet endpoints using token auth.
 * Supports JSON and optional JSONP fallback if you hit CORS.
 *
 * Usage:
 *
 * import { createIshebotClient } from './ishebotClient.js';
 *
 * const client = createIshebotClient({
 *   baseUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
 *   token: 'YOUR_ADMIN_TOKEN',
 *   useJsonp: false // set true if fetch gets CORS-blocked
 * });
 *
 * // Use the client
 * const students = await client.listStudents();
 * const stats = await client.stats();
 * await client.deleteAllAnalysed();
 */
export function createIshebotClient({ baseUrl, token, useJsonp = false, callbackName = "cb" }) {
  if (!baseUrl || !token) throw new Error("Missing baseUrl or token");

  /**
   * Generic API call function
   * @param {string} action - The API action to call
   * @param {object} params - Additional parameters
   * @returns {Promise<any>} - API response
   */
  async function call(action, params = {}) {
    const url = new URL(baseUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("token", token);

    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }

    if (!useJsonp) {
      // Standard fetch approach
      const res = await fetch(url.toString(), { method: "GET" });
      const text = await res.text();

      try {
        return JSON.parse(text);
      } catch {
        // Try to extract JSON from JSONP response
        const m = text.match(/^[\w$]+\((.*)\);?$/s);
        if (m) return JSON.parse(m[1]);
        throw new Error(`Unexpected response: ${text.slice(0, 180)}...`);
      }
    } else {
      // JSONP approach for CORS issues
      return new Promise((resolve, reject) => {
        const cb = `${callbackName}_${Math.random().toString(36).slice(2)}`;

        window[cb] = (data) => {
          try {
            resolve(data);
          } finally {
            delete window[cb];
            script.remove();
          }
        };

        url.searchParams.set("callback", cb);

        const script = document.createElement("script");
        script.src = url.toString();
        script.onerror = () => {
          delete window[cb];
          reject(new Error("JSONP load failed"));
        };

        document.head.appendChild(script);
      });
    }
  }

  // Return client object with methods
  return {
    /**
     * List all students (secure)
     * @returns {Promise<object>} List of students
     */
    listStudents: () => call("listStudents"),

    /**
     * Get dashboard statistics (secure)
     * @returns {Promise<object>} Dashboard stats
     */
    stats: () => call("statsSecure"),

    /**
     * Sync students from form responses (secure)
     * @returns {Promise<object>} Sync result
     */
    syncStudents: () => call("syncStudentsSecure"),

    /**
     * Initial sync of all students (secure)
     * @returns {Promise<object>} Initial sync result
     */
    initialSync: () => call("initialSyncSecure"),

    /**
     * Analyze a single student (secure)
     * @param {string} studentId - Student ID to analyze
     * @returns {Promise<object>} Analysis result
     */
    analyzeOneStudent: (studentId) => {
      if (!studentId) throw new Error("studentId required");
      return call("analyzeOneStudentSecure", { studentId });
    },

    /**
     * Delete all analysed students (creates backup first)
     * WARNING: This will clear all analyses!
     * @returns {Promise<object>} Delete result with backup info
     */
    deleteAllAnalysed: () => call("deleteAllAnalysed"),
  };
}
