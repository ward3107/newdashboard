import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n"; // Initialize i18n before app renders

// Ensure DOM is ready
const initApp = () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Failed to find the root element");
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Error Loading Application</h1><p>Could not find root element. Please refresh the page.</p></div>';
    return;
  }

  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Error Loading Application</h1><p>An error occurred while loading the application. Please refresh the page.</p></div>';
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
