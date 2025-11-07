/**
 * Generate concise RTL HTML for student data display
 * @param {Object} student - Student object with strengths, challenges, learning_style, and summary
 * @returns {string} HTML string for student analysis display
 */
export function generateStudentHTML(student) {
  const { strengths = [], challenges = [], learning_style = '', summary = '' } = student;

  // Helper function to format list items
  const formatList = (items, maxItems = 4) => {
    if (!items || items.length === 0) return '<li>—</li>';

    const displayItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;

    let html = displayItems.map(item => `<li>${item}</li>`).join('');

    if (remainingCount > 0) {
      html += `<li>ועוד ${remainingCount} נוספים...</li>`;
    }

    return html;
  };

  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <!-- Top Cards Row -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 0.5rem; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold;">${strengths.length}</div>
          <div style="font-size: 0.875rem; opacity: 0.9;">חוזקות</div>
        </div>
        <div style="flex: 1; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem; border-radius: 0.5rem; text-align: center;">
          <div style="font-size: 2rem; font-weight: bold;">${challenges.length}</div>
          <div style="font-size: 0.875rem; opacity: 0.9;">אתגרים</div>
        </div>
        <div style="flex: 1; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1rem; border-radius: 0.5rem; text-align: center;">
          <div style="font-size: 1.2rem; font-weight: bold; word-break: break-word;">${learning_style || '—'}</div>
          <div style="font-size: 0.875rem; opacity: 0.9;">סגנון למידה</div>
        </div>
      </div>

      <!-- Content Lists -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <!-- Strengths List -->
        <div style="flex: 1; background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; border-right: 3px solid #667eea;">
          <h3 style="margin: 0 0 0.5rem 0; color: #667eea; font-size: 1rem;">חוזקות</h3>
          <ul style="margin: 0; padding-right: 1.2rem; color: #333; font-size: 0.875rem; line-height: 1.5;">
            ${formatList(strengths)}
          </ul>
        </div>

        <!-- Challenges List -->
        <div style="flex: 1; background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; border-right: 3px solid #f5576c;">
          <h3 style="margin: 0 0 0.5rem 0; color: #f5576c; font-size: 1rem;">אתגרים</h3>
          <ul style="margin: 0; padding-right: 1.2rem; color: #333; font-size: 0.875rem; line-height: 1.5;">
            ${formatList(challenges)}
          </ul>
        </div>
      </div>

      <!-- Summary -->
      ${summary ? `
      <div style="background: #e8f4f8; padding: 1rem; border-radius: 0.5rem; border-right: 3px solid #00f2fe;">
        <h3 style="margin: 0 0 0.5rem 0; color: #00acc1; font-size: 1rem;">סיכום</h3>
        <p style="margin: 0; color: #555; font-size: 0.875rem; line-height: 1.5;">${summary}</p>
      </div>
      ` : ''}
    </div>
  `;
}

/**
 * Generate compact HTML for student data (alternative minimal version)
 */
export function generateCompactStudentHTML(student) {
  const { strengths = [], challenges = [], learning_style = '', summary = '' } = student;

  const formatCompactList = (items, maxItems = 3) => {
    if (!items || items.length === 0) return '—';
    const displayItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;
    let text = displayItems.join(' • ');
    if (remainingCount > 0) {
      text += ` • (+${remainingCount})`;
    }
    return text;
  };

  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 0.75rem; background: white; border-radius: 0.5rem; border: 1px solid #e0e0e0;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="background: #667eea; color: white; padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem;">חוזקות: ${strengths.length}</span>
        <span style="background: #f5576c; color: white; padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem;">אתגרים: ${challenges.length}</span>
        ${learning_style ? `<span style="background: #00f2fe; color: white; padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem;">${learning_style}</span>` : ''}
      </div>
      <div style="font-size: 0.8rem; color: #555; line-height: 1.4;">
        <div><strong style="color: #667eea;">חוזקות:</strong> ${formatCompactList(strengths)}</div>
        <div><strong style="color: #f5576c;">אתגרים:</strong> ${formatCompactList(challenges)}</div>
        ${summary ? `<div style="margin-top: 0.25rem;"><strong style="color: #00acc1;">סיכום:</strong> ${summary}</div>` : ''}
      </div>
    </div>
  `;
}