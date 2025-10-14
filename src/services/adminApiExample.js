/**
 * ISHEBOT Admin API Integration Example
 *
 * This file shows how to wire the ishebotClient into your dashboard.
 * Copy relevant sections into your actual dashboard component.
 *
 * SETUP:
 * 1. Add ADMIN_TOKEN to Google Apps Script:
 *    - Apps Script → Project Settings ⚙️ → Script Properties
 *    - Add property: ADMIN_TOKEN = YOUR_STRONG_SECRET
 *
 * 2. Deploy Google Apps Script as Web App:
 *    - Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy the Web App URL
 *
 * 3. Update your .env file:
 *    VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
 *    VITE_ADMIN_TOKEN=YOUR_ADMIN_TOKEN
 *
 * 4. Import and use the client in your dashboard
 */

import { createIshebotClient } from "./ishebotClient.js";

// ============================================
// INITIALIZATION
// ============================================

// Get config from environment variables (recommended)
const WEB_APP_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

// SECURITY WARNING: Never commit ADMIN_TOKEN to your repository!
// For production, use a server-side proxy to inject the token

// Initialize the client
const ishe = createIshebotClient({
  baseUrl: WEB_APP_URL,
  token: ADMIN_TOKEN,
  useJsonp: false, // set true if fetch gets CORS-blocked
});

// ============================================
// EXAMPLE USAGE IN REACT COMPONENT
// ============================================

/**
 * Example React component showing how to use the admin client
 */
export function AdminPanelExample() {
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState("");

  // Helper to display results
  const displayResult = (data) => {
    setOutput(JSON.stringify(data, null, 2));
  };

  // Handler functions for each action
  const handleListStudents = async () => {
    setLoading(true);
    try {
      const result = await ishe.listStudents();
      displayResult(result);
    } catch (error) {
      displayResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStats = async () => {
    setLoading(true);
    try {
      const result = await ishe.stats();
      displayResult(result);
    } catch (error) {
      displayResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStudents = async () => {
    setLoading(true);
    try {
      const result = await ishe.syncStudents();
      displayResult(result);
    } catch (error) {
      displayResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSync = async () => {
    setLoading(true);
    try {
      const result = await ishe.initialSync();
      displayResult(result);
    } catch (error) {
      displayResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStudent = async () => {
    if (!studentId.trim()) {
      displayResult({ error: "Student ID is required" });
      return;
    }

    setLoading(true);
    try {
      const result = await ishe.analyzeOneStudent(studentId);
      displayResult(result);
    } catch (error) {
      displayResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: Delete ALL analyses?\n\n" +
        "This will:\n" +
        "- Clear all rows in AI_Insights sheet\n" +
        "- Create a timestamped backup first\n" +
        "- Preserve the header row\n\n" +
        "Are you sure you want to continue?"
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await ishe.deleteAllAnalysed();
      displayResult(result);
      alert(`✅ Success!\n\nCleared: ${result.cleared} rows\nBackup: ${result.backup}`);
    } catch (error) {
      displayResult({ error: error.message });
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>ISHEBOT Admin Panel</h2>

      <div className="admin-actions">
        <button onClick={handleListStudents} disabled={loading}>
          📋 List Students
        </button>

        <button onClick={handleGetStats} disabled={loading}>
          📊 Get Statistics
        </button>

        <button onClick={handleSyncStudents} disabled={loading}>
          🔄 Sync Students
        </button>

        <button onClick={handleInitialSync} disabled={loading}>
          🚀 Initial Sync
        </button>

        <div className="analyze-section">
          <input
            type="text"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleAnalyzeStudent} disabled={loading}>
            🧠 Analyze Student
          </button>
        </div>

        <button
          onClick={handleDeleteAll}
          disabled={loading}
          className="danger-button"
        >
          🗑️ Delete All Analyses
        </button>
      </div>

      <div className="output">
        <h3>Output:</h3>
        <pre>{output || "No output yet..."}</pre>
      </div>

      {loading && <div className="loading-spinner">Loading...</div>}
    </div>
  );
}

// ============================================
// EXAMPLE USAGE IN VANILLA JS
// ============================================

/**
 * Example vanilla JavaScript integration
 * Use this if you're not using React
 */
export function setupAdminPanelVanilla() {
  // Helper to display results
  const out = (data) => {
    const el = document.querySelector("#output");
    if (!el) {
      console.log("OUT:", data);
      return;
    }
    el.textContent =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
  };

  // Bind buttons (adjust IDs to match your HTML)
  document.querySelector("#btnList")?.addEventListener("click", async () => {
    try {
      const result = await ishe.listStudents();
      out(result);
    } catch (error) {
      out({ error: error.message });
    }
  });

  document.querySelector("#btnStats")?.addEventListener("click", async () => {
    try {
      const result = await ishe.stats();
      out(result);
    } catch (error) {
      out({ error: error.message });
    }
  });

  document.querySelector("#btnSync")?.addEventListener("click", async () => {
    try {
      const result = await ishe.syncStudents();
      out(result);
    } catch (error) {
      out({ error: error.message });
    }
  });

  document
    .querySelector("#btnInitialSync")
    ?.addEventListener("click", async () => {
      try {
        const result = await ishe.initialSync();
        out(result);
      } catch (error) {
        out({ error: error.message });
      }
    });

  document
    .querySelector("#btnAnalyze")
    ?.addEventListener("click", async () => {
      const studentId = document.querySelector("#studentId")?.value.trim();
      if (!studentId) {
        out({ error: "studentId is required" });
        return;
      }

      try {
        const result = await ishe.analyzeOneStudent(studentId);
        out(result);
      } catch (error) {
        out({ error: error.message });
      }
    });

  document
    .querySelector("#btnDeleteAll")
    ?.addEventListener("click", async () => {
      if (!confirm("Delete ALL analyses? A backup will be created.")) return;

      try {
        const result = await ishe.deleteAllAnalysed();
        out(result);
        alert(
          `✅ Cleared ${result.cleared} rows. Backup: ${result.backup}`
        );
      } catch (error) {
        out({ error: error.message });
        alert(`❌ Error: ${error.message}`);
      }
    });
}

// ============================================
// EXPORT CLIENT FOR USE ELSEWHERE
// ============================================

/**
 * Export the initialized client so other modules can use it
 */
export { ishe as adminClient };
