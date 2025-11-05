import { useState, useEffect } from 'react';
import {
  X,
  User,
  Brain,
  Award,
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Star,
  Activity,
  Bell,
  ListChecks,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Download,
  Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as API from '../services/googleAppsScriptAPI';
import EnhancedAnalysisDisplay from './EnhancedAnalysisDisplay';

const EnhancedStudentDetail = ({ student, onClose, darkMode, theme }) => {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [customTask, setCustomTask] = useState('');
  const [reminder, setReminder] = useState({ enabled: false, date: '' });

  // Tab names for print/download
  const tabNames = {
    'overview': 'סקירה כללית',
    'analysis': 'ניתוח מפורט',
    'tasks': 'משימות ומעקב',
    'progress': 'התקדמות'
  };

  useEffect(() => {
    // Safety check: ensure student object exists
    if (!student) {
      setLoading(false);
      return;
    }

    // Fetch complete student data
    const fetchStudentDetails = async () => {
      try {
        // Safely get student code
        const studentCode = student.studentCode || student.code || student.id;

        if (!studentCode) {
          // If no student code, use the student data directly
          setFullData(student);
          generateAITasks(student);
          setLoading(false);
          return;
        }

        const result = await API.getStudent(studentCode);

        if (result.success && result.student) {
          setFullData(result.student);
          // Generate AI tasks based on analysis
          generateAITasks(result.student);
        } else {
          setFullData(student);
          generateAITasks(student);
        }
      } catch (error) {
        // Log errors in development mode only
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching student details:', error);
        }
        setFullData(student);
        generateAITasks(student);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [student]);

  // Generate AI-suggested tasks based on student analysis
  const generateAITasks = (studentData) => {
    const generatedTasks = [];

    // Priority 1: Address critical challenges
    if (studentData.challengesCount >= 5) {
      generatedTasks.push({
        id: 1,
        text: 'פגישה אישית עם התלמיד לדיון באתגרים המרכזיים',
        priority: 'high',
        category: 'intervention',
        completed: false,
        aiReason: 'התלמיד מתמודד עם מספר רב של אתגרים שדורשים תשומת לב מיידית'
      });
    }

    // Priority 2: Learning style adaptation
    if (studentData.learningStyle) {
      generatedTasks.push({
        id: 2,
        text: `התאמת חומרי למידה לסגנון ${studentData.learningStyle}`,
        priority: 'medium',
        category: 'adaptation',
        completed: false,
        aiReason: 'התאמת שיטות ההוראה לסגנון הלמידה המועדף תשפר את ההבנה'
      });
    }

    // Priority 3: Strengthen strengths
    if (studentData.strengthsCount >= 3) {
      generatedTasks.push({
        id: 3,
        text: 'מתן אתגרים נוספים בתחומי החוזק להעמקת הלמידה',
        priority: 'low',
        category: 'enrichment',
        completed: false,
        aiReason: 'חיזוק נקודות החוזק יעזור לבנות ביטחון עצמי'
      });
    }

    // Priority 4: Parent communication
    if (studentData.needsAnalysis || studentData.challengesCount >= 3) {
      generatedTasks.push({
        id: 4,
        text: 'עדכון הורים על ההתקדמות והאתגרים',
        priority: 'medium',
        category: 'communication',
        completed: false,
        aiReason: 'שיתוף ההורים חיוני להצלחת התהליך'
      });
    }

    setTasks(generatedTasks);
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addCustomTask = () => {
    if (customTask.trim()) {
      const newTask = {
        id: Date.now(),
        text: customTask,
        priority: 'medium',
        category: 'custom',
        completed: false,
        aiReason: null
      };
      setTasks([...tasks, newTask]);
      setCustomTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const setReminderDate = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    setReminder({
      enabled: true,
      date: oneWeekFromNow.toISOString().split('T')[0]
    });
  };

  const handlePrint = () => {
    // Get the actual visible content from the current tab
    const contentArea = document.querySelector('.p-6.overflow-y-auto');
    if (!contentArea) {
      alert('לא ניתן למצוא את התוכן להדפסה');
      return;
    }

    // Create a clean print window with professional formatting
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      alert('אנא אפשר חלונות קופצים כדי להדפיס');
      return;
    }

    // Clone the visible content - this gets ALL content including scrollable areas
    const contentClone = contentArea.cloneNode(true);

    // Remove overflow restrictions so all content shows
    contentClone.style.overflow = 'visible';
    contentClone.style.maxHeight = 'none';
    contentClone.style.height = 'auto';

    // Remove any buttons, interactive elements
    const buttons = contentClone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());

    // Remove inputs
    const inputs = contentClone.querySelectorAll('input, textarea');
    inputs.forEach(input => input.remove());

    // Remove SVG icons
    const svgs = contentClone.querySelectorAll('svg');
    svgs.forEach(svg => svg.remove());

    // Add spacing to prevent content from being cut across pages
    const majorSections = contentClone.querySelectorAll('.space-y-6 > div, .space-y-4 > div, [class*="rounded-xl"], [class*="rounded-lg"], h2, h3');
    majorSections.forEach((section) => {
      section.style.marginBottom = '25px';
      section.style.paddingBottom = '15px';
      section.style.pageBreakInside = 'avoid';
      section.style.breakInside = 'avoid';

      if (section.tagName === 'DIV' && section.classList.length > 0) {
        section.style.borderBottom = '1px solid #e0e0e0';
      }
    });

    // Specific handling for insights and tasks
    const insights = contentClone.querySelectorAll('[style*="border-right: 4px solid"], .assignment, .task-item');
    insights.forEach(insight => {
      insight.style.pageBreakInside = 'avoid';
      insight.style.breakInside = 'avoid';
      insight.style.marginBottom = '20px';
      insight.style.paddingBottom = '10px';
    });

    const printContent = contentClone.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>${tabNames[activeTab]} - ${student.studentCode}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            padding: 40px;
            line-height: 1.8;
            color: #000;
            background: #fff;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #000;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          h1 { font-size: 24px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }
          h4 { font-size: 16px; }
          p {
            margin-bottom: 10px;
            line-height: 1.6;
          }
          /* Remove all emojis and icons */
          svg, img {
            display: none !important;
          }
          /* Clean borders and backgrounds */
          div, section {
            border-color: #000 !important;
            page-break-inside: avoid;
          }
          /* Ensure all content is visible - no scrolling needed */
          * {
            overflow: visible !important;
            max-height: none !important;
          }
          .overflow-y-auto, .overflow-hidden, .overflow-scroll {
            overflow: visible !important;
            max-height: none !important;
          }
          /* Make backgrounds print-friendly */
          .bg-gray-50, .bg-gray-100, .bg-gray-800, .bg-gray-900 {
            background: #f9f9f9 !important;
          }
          .bg-blue-50, .bg-blue-100 {
            background: #e3f2fd !important;
          }
          .bg-green-50, .bg-green-100 {
            background: #e8f5e9 !important;
          }
          .bg-red-50, .bg-red-100 {
            background: #ffebee !important;
          }
          .bg-yellow-50, .bg-yellow-100 {
            background: #fff9c4 !important;
          }
          /* Make text visible */
          .text-white, .text-gray-300, .text-gray-400 {
            color: #000 !important;
          }
          /* Grid layouts */
          .grid {
            display: grid;
            gap: 15px;
          }
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          /* Spacing with page break protection */
          .space-y-6 > * + * {
            margin-top: 24px;
            margin-bottom: 24px;
          }
          .space-y-4 > * + * {
            margin-top: 16px;
            margin-bottom: 16px;
          }
          .space-y-3 > * + * {
            margin-top: 12px;
            margin-bottom: 12px;
          }
          .space-y-2 > * + * {
            margin-top: 8px;
            margin-bottom: 8px;
          }
          /* Add spacing to major content blocks */
          [class*="rounded-xl"], [class*="rounded-lg"] {
            margin-bottom: 25px !important;
            padding-bottom: 15px !important;
          }
          /* Padding */
          .p-6 { padding: 24px; }
          .p-4 { padding: 16px; }
          .p-3 { padding: 12px; }
          .p-2 { padding: 8px; }
          /* Rounded corners for print */
          .rounded-xl, .rounded-lg {
            border: 1px solid #ddd;
            padding: 10px;
          }
          /* Header */
          .header-print {
            margin-bottom: 30px;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
          }
          @media print {
            body {
              padding: 20px;
            }
            /* Prevent content from breaking in the middle */
            .section, h2, h3, .assignment, .task-item,
            [class*="rounded-xl"], [class*="rounded-lg"],
            [class*="p-4"], [class*="p-6"],
            [style*="border-right: 4px solid"] {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 25px !important;
              padding-bottom: 15px !important;
            }
            /* Avoid breaks after headings */
            h1, h2, h3, h4 {
              page-break-after: avoid !important;
              break-after: avoid !important;
              margin-bottom: 15px !important;
            }
            /* Widows and orphans */
            p {
              widows: 3;
              orphans: 3;
            }
            /* Ensure list items don't break */
            li, ul, ol {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Add space between major sections */
            div > div {
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-print">
          <h1>${tabNames[activeTab]}</h1>
          <p><strong>קוד תלמיד:</strong> ${student.studentCode} | <strong>כיתה:</strong> ${student.classId} | <strong>תאריך:</strong> ${student.date || 'רבעון 1'}</p>
          <p><strong>תאריך יצירת דוח:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        ${printContent}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #000; font-size: 12px; color: #666;">
          <p>דוח זה הופק באמצעות מערכת ניתוח תלמידים מבוססת בינה מלאכותית (ISHEBOT)</p>
          <p>תאריך יצירה: ${new Date().toLocaleString('he-IL')}</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const generatePrintContent = () => {
    const studentAssignments = JSON.parse(localStorage.getItem(`assignments_${student.studentCode}`) || '[]');
    const strengths = fullData?.strengths || (typeof student.strengths === 'string' ? [student.strengths] : student.strengths) || [];
    const challenges = fullData?.challenges || (typeof student.challenges === 'string' ? [student.challenges] : student.challenges) || [];

    // Get ISHEBOT insights if available
    const insights = fullData?.insights || [];
    const ishebotReport = fullData?.ishebotReport || {};

    // Helper to clean text
    const cleanText = (text) => String(text || '').replace(/[^\u0590-\u05FF\s\w.,;:!?()"-]/g, '');

    // Get tab name in Hebrew (using tabNames from component scope)

    // Header for all tabs
    const header = `
      <div class="header">
        <h1>דוח ${tabNames[activeTab]} - ${student.studentCode}</h1>
        <div class="info-row">
          <div><span class="info-label">קוד תלמיד:</span> ${student.studentCode}</div>
          <div><span class="info-label">כיתה:</span> ${student.classId}</div>
          <div><span class="info-label">תאריך:</span> ${student.date || 'רבעון 1'}</div>
        </div>
        <div class="info-row">
          <div><span class="info-label">תאריך יצירת דוח:</span> ${new Date().toLocaleDateString('he-IL')}</div>
        </div>
      </div>
    `;

    // Footer for all tabs
    const footer = `
      <div class="footer">
        <p>דוח זה הופק באמצעות מערכת ניתוח תלמידים מבוססת בינה מלאכותית (ISHEBOT)</p>
        <p>תאריך יצירה: ${new Date().toLocaleString('he-IL')}</p>
      </div>
    `;

    // Generate content based on active tab
    let tabContent = '';

    if (activeTab === 'overview') {
      // OVERVIEW TAB - Only basic overview
      tabContent = `
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-label">חוזקות</div>
            <div class="stat-value">${student.strengthsCount || 0}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">אתגרים</div>
            <div class="stat-value">${student.challengesCount || 0}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">סגנון למידה</div>
            <div class="stat-value" style="font-size: 16px;">${student.learningStyle || 'לא זוהה'}</div>
          </div>
        </div>

        <div class="section">
          <h2>סיכום כללי</h2>
          <p>${cleanText(ishebotReport?.summary || fullData?.summary || student.keyNotes || 'טרם בוצע ניתוח מלא')}</p>
        </div>

        ${strengths.length > 0 ? `
          <div class="section">
            <h2>חוזקות מזוהות</h2>
            <ul>
              ${strengths.map(s => `<li>${cleanText(s)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${challenges.length > 0 ? `
          <div class="section">
            <h2>אתגרים מזוהים</h2>
            <ul>
              ${challenges.map(c => `<li>${cleanText(c)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;
    } else if (activeTab === 'analysis') {
      // ANALYSIS TAB - Only detailed analysis
      tabContent = `
        ${insights.length > 0 ? `
          <div class="section">
            <h2>תובנות מעמיקות מניתוח ISHEBOT</h2>
            ${insights.map((insight, idx) => `
              <div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-right: 4px solid #3498db;">
                <h3 style="margin-bottom: 8px; font-size: 16px;">${idx + 1}. ${cleanText(insight.title)}</h3>
                <div style="margin-bottom: 8px;">
                  <strong>קטגוריה:</strong> ${cleanText(insight.category)}
                  ${insight.relatedQuestions ? ` | <strong>שאלות קשורות:</strong> ${cleanText(insight.relatedQuestions)}` : ''}
                </div>
                <p style="margin-bottom: 10px; line-height: 1.6;">${cleanText(insight.description)}</p>
                ${insight.recommendations && insight.recommendations.length > 0 ? `
                  <div style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #e0e0e0;">
                    <strong>המלצות פעולה:</strong>
                    <ul style="margin-top: 5px; padding-right: 20px;">
                      ${insight.recommendations.map(rec => `
                        <li style="margin: 5px 0;">
                          <strong>${cleanText(rec.text)}</strong>
                          <div style="font-size: 11px; color: #666; margin-top: 3px;">
                            עדיפות: ${rec.priority === 'high' ? 'גבוהה' : rec.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                            ${rec.implementation ? ` | יישום: ${cleanText(rec.implementation)}` : ''}
                          </div>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${ishebotReport?.academicAnalysis ? `
          <div class="section">
            <h2>ניתוח אקדמי</h2>
            <p>${cleanText(ishebotReport.academicAnalysis)}</p>
          </div>
        ` : ''}

        ${ishebotReport?.socialAnalysis ? `
          <div class="section">
            <h2>ניתוח חברתי</h2>
            <p>${cleanText(ishebotReport.socialAnalysis)}</p>
          </div>
        ` : ''}

        ${ishebotReport?.emotionalAnalysis ? `
          <div class="section">
            <h2>ניתוח רגשי</h2>
            <p>${cleanText(ishebotReport.emotionalAnalysis)}</p>
          </div>
        ` : ''}

        ${ishebotReport?.behavioralAnalysis ? `
          <div class="section">
            <h2>ניתוח התנהגותי</h2>
            <p>${cleanText(ishebotReport.behavioralAnalysis)}</p>
          </div>
        ` : ''}

        ${fullData?.analysis || student.keyNotes ? `
          <div class="section">
            <h2>ניתוח מפורט נוסף</h2>
            <p>${cleanText(fullData?.analysis || student.keyNotes)}</p>
          </div>
        ` : ''}
      `;
    } else if (activeTab === 'tasks') {
      // TASKS TAB - Only tasks and assignments
      tabContent = `
        ${studentAssignments.length > 0 ? `
          <div class="section">
            <h2>משימות מהמלצות (${studentAssignments.length})</h2>
            ${studentAssignments.map(assignment => `
              <div class="assignment">
                <div><strong>${cleanText(assignment.recommendation)}</strong></div>
                <div style="margin-top: 5px; font-size: 12px;">
                  <span>עדיפות: ${assignment.priority === 'high' ? 'גבוהה' : assignment.priority === 'medium' ? 'בינונית' : 'נמוכה'}</span> |
                  <span>קטגוריה: ${assignment.category}</span> |
                  <span>תזכורת: ${new Date(assignment.reminderDate).toLocaleDateString('he-IL')}</span>
                  ${assignment.status === 'completed' ? ' | <strong>הושלם</strong>' : ''}
                </div>
                ${assignment.implementation ? `<div style="font-size: 11px; margin-top: 5px; color: #555;">יישום: ${cleanText(assignment.implementation)}</div>` : ''}
                ${assignment.rating ? `
                  <div style="margin-top: 5px; padding: 5px; background: #fff; border: 1px solid #ddd;">
                    <div><strong>דירוג הצלחה: ${assignment.rating.successLevel}/5</strong></div>
                    <div style="font-size: 12px;">${cleanText(assignment.rating.observedChanges)}</div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${tasks.length > 0 ? `
          <div class="section">
            <h2>משימות מומלצות AI</h2>
            ${tasks.map(task => `
              <div class="task-item ${task.completed ? 'task-completed' : ''} task-priority-${task.priority}">
                <div><strong>${task.completed ? '[הושלם] ' : ''}${cleanText(task.text)}</strong></div>
                ${task.aiReason ? `<div style="font-size: 12px; margin-top: 3px; color: #666;">${cleanText(task.aiReason)}</div>` : ''}
                <div style="font-size: 11px; margin-top: 3px;">עדיפות: ${task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;
    } else if (activeTab === 'progress') {
      // PROGRESS TAB
      tabContent = `
        <div class="section">
          <h2>מעקב התקדמות</h2>
          <p>מעקב התקדמות יהיה זמין בקרוב. כאן יוצגו גרפים ונתונים על השיפור לאורך זמן.</p>
        </div>
      `;
    }

    return header + tabContent + footer;
  };

  const handleDownload = async () => {
    try {
      // Show loading indicator
      const loadingDiv = document.createElement('div');
      loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:10000;';
      loadingDiv.innerHTML = '<div style="text-align:center;">מייצר PDF...<br><div style="margin-top:10px;width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;animation:spin 1s linear infinite;margin:10px auto;"></div></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
      document.body.appendChild(loadingDiv);

      // Get the actual visible content from the current tab
      const contentArea = document.querySelector('.p-6.overflow-y-auto');
      if (!contentArea) {
        alert('לא ניתן למצוא את התוכן להדפסה');
        document.body.removeChild(loadingDiv);
        return;
      }

      // Create a temporary container with the actual visible content
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:white;padding:40px;direction:rtl;font-family:Arial,sans-serif;';

      // Add header
      const header = document.createElement('div');
      header.style.cssText = 'margin-bottom:30px;border-bottom:3px solid #000;padding-bottom:15px;';
      header.innerHTML = `
        <h1 style="font-size:24px;margin-bottom:10px;">${tabNames[activeTab]}</h1>
        <p style="font-size:14px;"><strong>קוד תלמיד:</strong> ${student.studentCode} | <strong>כיתה:</strong> ${student.classId} | <strong>תאריך:</strong> ${student.date || 'רבעון 1'}</p>
        <p style="font-size:14px;"><strong>תאריך יצירת דוח:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
      `;
      tempContainer.appendChild(header);

      // Clone the visible content - this gets ALL content including scrollable areas
      const contentClone = contentArea.cloneNode(true);

      // Remove overflow restrictions so all content shows in PDF
      contentClone.style.overflow = 'visible';
      contentClone.style.maxHeight = 'none';
      contentClone.style.height = 'auto';

      // Remove buttons and inputs
      const buttons = contentClone.querySelectorAll('button');
      buttons.forEach(btn => btn.remove());
      const inputs = contentClone.querySelectorAll('input, textarea');
      inputs.forEach(input => input.remove());

      // Remove SVG icons
      const svgs = contentClone.querySelectorAll('svg');
      svgs.forEach(svg => svg.remove());

      // Ensure all nested overflow containers show full content
      const overflowElements = contentClone.querySelectorAll('[style*="overflow"]');
      overflowElements.forEach(el => {
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
        el.style.height = 'auto';
      });

      // Add spacing to prevent content from being cut across pages
      const majorSections = contentClone.querySelectorAll('.space-y-6 > div, .space-y-4 > div, [class*="rounded-xl"], [class*="rounded-lg"], h2, h3');
      majorSections.forEach((section, index) => {
        // Add bottom margin to create natural break points
        section.style.marginBottom = '25px';
        section.style.paddingBottom = '15px';
        section.style.pageBreakInside = 'avoid';
        section.style.breakInside = 'avoid';

        // Add border to clearly separate sections
        if (section.tagName === 'DIV' && section.classList.length > 0) {
          section.style.borderBottom = '1px solid #e0e0e0';
        }
      });

      // Specific handling for insights and tasks to keep them together
      const insights = contentClone.querySelectorAll('[style*="border-right: 4px solid"], .assignment, .task-item');
      insights.forEach(insight => {
        insight.style.pageBreakInside = 'avoid';
        insight.style.breakInside = 'avoid';
        insight.style.marginBottom = '20px';
        insight.style.paddingBottom = '10px';
      });

      tempContainer.appendChild(contentClone);

      // Add footer
      const footer = document.createElement('div');
      footer.style.cssText = 'margin-top:40px;padding-top:20px;border-top:2px solid #000;font-size:12px;color:#666;';
      footer.innerHTML = `
        <p>דוח זה הופק באמצעות מערכת ניתוח תלמידים מבוססת בינה מלאכותית (ISHEBOT)</p>
        <p>תאריך יצירה: ${new Date().toLocaleString('he-IL')}</p>
      `;
      tempContainer.appendChild(footer);

      document.body.appendChild(tempContainer);

      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add page break markers to the content
      const sections = tempContainer.querySelectorAll('.section, h2, h3, .assignment, .task-item, [class*="rounded-xl"], [class*="rounded-lg"]');
      sections.forEach(section => {
        section.style.pageBreakInside = 'avoid';
        section.style.breakInside = 'avoid';
      });

      // Convert HTML to canvas with better quality
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowHeight: tempContainer.scrollHeight,
        windowWidth: tempContainer.scrollWidth
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);

      // Calculate proper scaling
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / contentHeight);

      // Add pages with proper positioning to avoid content cutoff
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const yOffset = -(page * contentHeight);

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          yOffset + margin,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      // Remove loading indicator
      document.body.removeChild(loadingDiv);

      // Save the PDF with tab name
      pdf.save(`student_${student.studentCode}_${activeTab}.pdf`);
    } catch (error) {
      // Log errors in development mode only
      if (process.env.NODE_ENV === 'development') {
        console.error('Error generating PDF:', error);
      }
      alert('שגיאה ביצירת קובץ PDF. אנא נסה שנית.\n\nפרטים: ' + error.message);

      // Remove loading indicator if it exists
      const loadingDiv = document.querySelector('div[style*="position:fixed"]');
      if (loadingDiv) {
        document.body.removeChild(loadingDiv);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: User },
    { id: 'analysis', label: 'ניתוח מפורט', icon: Brain },
    { id: 'tasks', label: 'משימות ומעקב', icon: ListChecks },
    { id: 'progress', label: 'התקדמות', icon: TrendingUp },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-500 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  // Safety check: if student is null or undefined, show error
  if (!student) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        onClick={onClose}
      >
        <div className={`p-8 rounded-3xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          <h2 className="text-xl font-bold mb-4">שגיאה</h2>
          <p>לא ניתן לטעון את פרטי התלמיד</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`relative h-32 bg-gradient-to-r ${theme.primary} p-6`}>
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Action buttons on the left side */}
          <div className="absolute top-4 left-4 flex gap-2 z-50">
            <button
              onClick={handleDownload}
              className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all cursor-pointer"
              title="הורד דוח"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <Download size={24} className="text-white" />
            </button>
            <button
              onClick={handlePrint}
              className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all cursor-pointer"
              title="הדפס"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <Printer size={24} className="text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all cursor-pointer"
              title="סגור"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Student header info */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="text-4xl bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
              {student.needsAnalysis ? "📝" : "⭐"}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{student.studentCode}</h1>
              <div className="flex items-center gap-3 text-white/90">
                <span>{student.classId}</span>
                <span>•</span>
                <span>{student.date || 'רבעון 1'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 transition-all ${
                activeTab === tab.id
                  ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b-2 border-blue-500`
                  : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <tab.icon size={16} />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={`p-6 overflow-y-auto max-h-[calc(90vh-14rem)] ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="text-green-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>חוזקות</span>
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.strengthsCount || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-amber-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>אתגרים</span>
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.challengesCount || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="text-purple-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>סגנון למידה</span>
                      </div>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.learningStyle || 'לא זוהה'}
                      </p>
                    </div>
                  </div>

                  {/* Summary - Display ISHEBOT summary if available */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Sparkles className="text-yellow-500" size={20} />
                      סיכום כללי
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-right`} dir="rtl">
                      {fullData?.ishebotReport?.summary || fullData?.summary || student.keyNotes || 'טרם בוצע ניתוח מלא עבור תלמיד זה'}
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Tab - Enhanced Analysis */}
              {activeTab === 'analysis' && (
                <EnhancedAnalysisDisplay
                  studentData={fullData || student}
                  darkMode={darkMode}
                  theme={theme}
                />
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Recommendation Assignments - Show assignments from the recommendations tab */}
                  {(() => {
                    const studentAssignments = JSON.parse(localStorage.getItem(`assignments_${student.studentCode}`) || '[]');
                    return studentAssignments.length > 0 && (
                      <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-900/20 border-2 border-blue-700' : 'bg-blue-50 border-2 border-blue-300'}`}>
                        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Target className="text-blue-500" size={20} />
                          משימות מהמלצות ({studentAssignments.length})
                        </h3>

                        <div className="space-y-3">
                          {studentAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`p-4 rounded-lg border ${
                                assignment.status === 'completed'
                                  ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                                  : darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {assignment.status === 'completed' ? (
                                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                                ) : (
                                  <Clock className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                                )}

                                <div className="flex-1">
                                  <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {assignment.recommendation}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded-full ${
                                      assignment.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : assignment.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {assignment.priority === 'high' ? 'דחוף' : assignment.priority === 'medium' ? 'בינוני' : 'נמוך'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      📅 {new Date(assignment.reminderDate).toLocaleDateString('he-IL')}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      📂 {assignment.category}
                                    </span>
                                    {assignment.status === 'completed' && (
                                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        ✅ הושלם
                                      </span>
                                    )}
                                  </div>
                                  {assignment.rating && (
                                    <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-yellow-500" size={16} />
                                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          דירוג: {assignment.rating.successLevel}/5
                                        </span>
                                      </div>
                                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {assignment.rating.observedChanges}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* AI Suggested Tasks */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Zap className="text-yellow-500" size={20} />
                      משימות מומלצות ע״י AI
                    </h3>

                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-1"
                            >
                              {task.completed ? (
                                <CheckSquare className="text-green-500" size={20} />
                              ) : (
                                <Square className={darkMode ? "text-gray-400" : "text-gray-500"} size={20} />
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`${task.completed ? 'line-through opacity-60' : ''} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {task.text}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                                </span>
                              </div>

                              {task.aiReason && (
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                  💡 {task.aiReason}
                                </p>
                              )}
                            </div>

                            {task.category === 'custom' && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className={`p-1 hover:bg-red-100 rounded ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Task */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={customTask}
                        onChange={(e) => setCustomTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                        placeholder="הוסף משימה חדשה..."
                        className={`flex-1 px-4 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                        } border`}
                      />
                      <button
                        onClick={addCustomTask}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        הוסף
                      </button>
                    </div>
                  </div>

                  {/* Reminder Section */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Bell className="text-blue-500" size={20} />
                      תזכורת למעקב
                    </h3>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={setReminderDate}
                        className={`px-4 py-2 rounded-lg ${
                          reminder.enabled
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {reminder.enabled ? '✓ תזכורת הוגדרה' : 'הגדר תזכורת לשבוע הבא'}
                      </button>

                      {reminder.enabled && (
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {reminder.date}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>מעקב התקדמות יהיה זמין בקרוב</p>
                  <p className="text-sm mt-2">כאן יוצגו גרפים ונתונים על השיפור לאורך זמן</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ title, icon: Icon, items, color, darkMode }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <Icon className={`text-${color}-500`} size={20} />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${colorClasses[color]} border`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedStudentDetail;