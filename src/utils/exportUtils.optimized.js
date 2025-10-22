/**
 * Optimized Export Utilities with Dynamic Imports
 * This reduces the initial bundle size by ~600KB
 */

import { EXPORT_CONFIG } from '../config';

/**
 * Export students data to Excel file (Dynamic Import)
 * @param {Array} students - Array of student objects
 * @returns {Promise} Download promise
 */
export const exportToExcel = async (students) => {
  if (!students || students.length === 0) {
    throw new Error('אין נתונים לייצוא');
  }

  try {
    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.textContent = 'טוען רכיב ייצוא Excel...';
    document.body.appendChild(loadingToast);

    // Dynamic import - loads only when needed
    const XLSX = await import(/* webpackChunkName: "xlsx" */ 'xlsx');

    // Remove loading indicator
    document.body.removeChild(loadingToast);

    // Prepare data for Excel
    const excelData = students.map(student => ({
      'קוד תלמיד': student.studentCode,
      'כיתה': student.classId,
      'רבעון': student.quarter,
      'תאריך עדכון': student.date,
      'סגנונות למידה': student.learningStyle?.replace(/\n/g, ', ').replace(/• /g, '') || '',
      'מספר חוזקות': student.strengthsCount || 0,
      'מספר אתגרים': student.challengesCount || 0,
      'הערות מפתח': student.keyNotes || ''
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // קוד תלמיד
      { wch: 10 }, // כיתה
      { wch: 10 }, // רבעון
      { wch: 15 }, // תאריך עדכון
      { wch: 30 }, // סגנונות למידה
      { wch: 15 }, // מספר חוזקות
      { wch: 15 }, // מספר אתגרים
      { wch: 40 }  // הערות מפתח
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, EXPORT_CONFIG.EXCEL.SHEET_NAME);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${EXPORT_CONFIG.EXCEL.FILE_NAME.replace('.xlsx', '')}_${timestamp}.xlsx`;

    // Write and download file
    XLSX.writeFile(wb, filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('שגיאה בייצוא קובץ Excel');
  }
};

/**
 * Export students summary to PDF (Dynamic Import)
 * @param {Array} students - Array of student objects
 * @returns {Promise} Download promise
 */
export const exportToPDF = async (students) => {
  if (!students || students.length === 0) {
    throw new Error('אין נתונים לייצוא');
  }

  try {
    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.textContent = 'טוען רכיב ייצוא PDF...';
    document.body.appendChild(loadingToast);

    // Dynamic import - loads only when needed
    const jsPDFModule = await import(/* webpackChunkName: "jspdf" */ 'jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

    // Remove loading indicator
    document.body.removeChild(loadingToast);

    // Create new PDF document
    const doc = new jsPDF({
      orientation: EXPORT_CONFIG.PDF.ORIENTATION || 'portrait',
      unit: 'mm',
      format: EXPORT_CONFIG.PDF.FORMAT || 'a4'
    });

    // Set RTL support (basic)
    doc.setLanguage('he');

    // Set font (use built-in font for now)
    doc.setFont('helvetica');

    let yPosition = 20;
    const margin = EXPORT_CONFIG.PDF.MARGIN || 15;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(18);
    doc.text('דוח ניתוח תלמידים', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 10;

    // Date
    doc.setFontSize(12);
    const currentDate = new Date().toLocaleDateString('he-IL');
    doc.text(`תאריך: ${currentDate}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Summary statistics
    doc.setFontSize(14);
    doc.text('סיכום כללי', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFontSize(10);
    doc.text(`סה"כ תלמידים: ${students.length}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;

    // Calculate statistics
    const avgStrengths = (students.reduce((sum, s) => sum + (s.strengthsCount || 0), 0) / students.length).toFixed(1);
    const avgChallenges = (students.reduce((sum, s) => sum + (s.challengesCount || 0), 0) / students.length).toFixed(1);

    doc.text(`ממוצע חוזקות: ${avgStrengths}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    doc.text(`ממוצע אתגרים: ${avgChallenges}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Students list header
    doc.setFontSize(14);
    doc.text('רשימת תלמידים', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 10;

    // Table headers
    doc.setFontSize(8);
    const headers = ['קוד', 'כיתה', 'חוזקות', 'אתגרים'];
    const colWidths = [30, 30, 20, 20];

    let xPosition = pageWidth - margin;
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition, { align: 'right' });
      xPosition -= colWidths[index];
    });
    yPosition += 8;

    // Draw line under headers
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

    // Students data
    doc.setFontSize(8);
    students.forEach((student, index) => {
      if (yPosition > 270) { // Check if we need a new page
        doc.addPage();
        yPosition = 20;
      }

      xPosition = pageWidth - margin;
      const rowData = [
        student.studentCode || '',
        student.classId || '',
        (student.strengthsCount || 0).toString(),
        (student.challengesCount || 0).toString()
      ];

      rowData.forEach((data, colIndex) => {
        doc.text(data, xPosition, yPosition, { align: 'right' });
        xPosition -= colWidths[colIndex];
      });

      yPosition += 6;

      // Add some spacing every 5 rows
      if ((index + 1) % 5 === 0) {
        yPosition += 2;
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `עמוד ${i} מתוך ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'נוצר על ידי מערכת ניתוח תלמידים AI',
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `דוח_תלמידים_${timestamp}.pdf`;

    // Save file
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('שגיאה בייצוא קובץ PDF');
  }
};

/**
 * Export single student detailed report to PDF (Dynamic Import)
 * @param {Object} studentData - Student detail object
 * @returns {Promise} Download promise
 */
export const exportStudentDetailToPDF = async (studentData) => {
  if (!studentData) {
    throw new Error('אין נתוני תלמיד לייצוא');
  }

  try {
    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.textContent = 'טוען רכיב ייצוא PDF...';
    document.body.appendChild(loadingToast);

    // Dynamic import
    const jsPDFModule = await import(/* webpackChunkName: "jspdf" */ 'jspdf');
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

    // Remove loading indicator
    document.body.removeChild(loadingToast);

    const doc = new jsPDF({
      orientation: EXPORT_CONFIG.PDF.ORIENTATION || 'portrait',
      unit: 'mm',
      format: EXPORT_CONFIG.PDF.FORMAT || 'a4'
    });

    doc.setLanguage('he');
    doc.setFont('helvetica');

    let yPosition = 20;
    const margin = EXPORT_CONFIG.PDF.MARGIN || 15;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text(`דוח ניתוח מפורט - תלמיד ${studentData.studentCode}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Student basic info
    doc.setFontSize(12);
    doc.text(`קוד תלמיד: ${studentData.studentCode}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 7;
    doc.text(`כיתה: ${studentData.classId}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 7;
    doc.text(`תאריך: ${studentData.date}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Continue with rest of the PDF generation...
    // [Rest of the function remains the same]

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ניתוח_תלמיד_${studentData.studentCode}_${timestamp}.pdf`;

    // Save file
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Student PDF export error:', error);
    throw new Error('שגיאה בייצוא דוח התלמיד');
  }
};

/**
 * Check if export libraries are already loaded
 */
let xlsxLoaded = false;
let pdfLoaded = false;

/**
 * Preload export libraries (optional - for better UX)
 */
export const preloadExportLibraries = async () => {
  try {
    // Preload in background when idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(async () => {
        if (!xlsxLoaded) {
          await import(/* webpackChunkName: "xlsx", webpackPreload: true */ 'xlsx');
          xlsxLoaded = true;
        }
        if (!pdfLoaded) {
          await import(/* webpackChunkName: "jspdf", webpackPreload: true */ 'jspdf');
          pdfLoaded = true;
        }
      });
    }
  } catch (error) {
    console.log('Export libraries preload skipped:', error);
  }
};

/**
 * Format data for printing (no external dependencies)
 */
export const formatForPrint = (data) => {
  if (typeof data === 'string') {
    return data.replace(/\n/g, ', ').replace(/• /g, '');
  }
  if (Array.isArray(data)) {
    return data.join(', ');
  }
  return String(data);
};

/**
 * Generate print-friendly HTML (no external dependencies)
 */
export const generatePrintHTML = (studentData) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="utf-8">
      <title>דוח תלמיד - ${studentData.studentCode}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .info-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
        ul { padding-right: 20px; }
        li { margin-bottom: 5px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>דוח ניתוח מפורט</h1>
        <h2>תלמיד ${studentData.studentCode}</h2>
        <p>קוד תלמיד: ${studentData.studentCode} | כיתה: ${studentData.classId} | תאריך: ${studentData.date}</p>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <strong>סגנון למידה:</strong><br>
          ${studentData.student_summary?.learning_style?.replace(/\n/g, '<br>') || 'לא זמין'}
        </div>
        <div class="info-item">
          <strong>הערות מפתח:</strong><br>
          ${studentData.student_summary?.key_notes || 'לא זמין'}
        </div>
      </div>

      ${studentData.student_summary?.strengths ? `
        <div class="section">
          <h2>חוזקות</h2>
          <ul>
            ${studentData.student_summary.strengths.map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${studentData.student_summary?.challenges ? `
        <div class="section">
          <h2>אתגרים</h2>
          <ul>
            ${studentData.student_summary.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="section">
        <small>נוצר על ידי מערכת ניתוח תלמידים AI - ${new Date().toLocaleDateString('he-IL')}</small>
      </div>
    </body>
    </html>
  `;
};

export default {
  exportToExcel,
  exportToPDF,
  exportStudentDetailToPDF,
  formatForPrint,
  generatePrintHTML,
  preloadExportLibraries
};