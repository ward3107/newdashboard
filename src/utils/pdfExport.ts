/**
 * PDF Export Utility
 * Generates professional PDF reports from analytics data
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  title: string;
  subtitle?: string;
  darkMode?: boolean;
  includeCharts?: boolean;
}

/**
 * Generate PDF from analytics data
 */
export async function generateAnalyticsPDF(
  data: any,
  options: ExportOptions = { title: 'דוח ניתוח תלמידים' }
): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Add Hebrew font support (simplified - uses built-in fonts)
    pdf.setFont('helvetica');

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(33, 37, 41);
    pdf.text(options.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.setTextColor(108, 117, 125);
      pdf.text(options.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }

    // Date
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    pdf.setFontSize(10);
    pdf.setTextColor(108, 117, 125);
    pdf.text(`Generated on: ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add a horizontal line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Overview Section
    pdf.setFontSize(16);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Overview / סקירה כללית', margin, yPosition);
    yPosition += 10;

    // Statistics
    pdf.setFontSize(11);
    pdf.setTextColor(52, 58, 64);

    const stats = [
      { label: 'Total Students / סה"כ תלמידים', value: data.totalStudents || 0 },
      { label: 'Analyzed / מנותחים', value: data.analyzedStudents || 0 },
      { label: 'Needs Analysis / דורשים ניתוח', value: data.needsAnalysis || data.unanalyzedStudents || 0 },
      { label: 'Average Grade / ציון ממוצע', value: data.averageGrade ? `${data.averageGrade.toFixed(1)}%` : 'N/A' },
      { label: 'Completion Rate / אחוז השלמה', value: data.completionRate || data.analysisCompletionRate ? `${(data.completionRate || data.analysisCompletionRate).toFixed(1)}%` : 'N/A' },
    ];

    stats.forEach(stat => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.label + ':', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(String(stat.value), margin + 80, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Performance Distribution
    pdf.setFontSize(14);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Performance Distribution / התפלגות ביצועים', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(52, 58, 64);
    const perfDist = [
      { label: 'Excellent (90+) / מצוין', value: data.performanceDistribution?.excellent || 0, color: [34, 197, 94] },
      { label: 'Good (80-89) / טוב', value: data.performanceDistribution?.good || 0, color: [59, 130, 246] },
      { label: 'Average (70-79) / ממוצע', value: data.performanceDistribution?.average || 0, color: [251, 191, 36] },
      { label: 'Needs Support (<70) / דורש תמיכה', value: data.performanceDistribution?.needsSupport || 0, color: [239, 68, 68] },
    ];

    perfDist.forEach(item => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      // Color indicator
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      pdf.rect(margin, yPosition - 3, 4, 4, 'F');

      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label + ':', margin + 6, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(item.value), margin + 90, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Risk Distribution
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Risk Assessment / הערכת סיכונים', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(52, 58, 64);
    const riskDist = [
      { label: 'High Risk / סיכון גבוה', value: data.riskDistribution?.high || 0, color: [239, 68, 68] },
      { label: 'Medium Risk / סיכון בינוני', value: data.riskDistribution?.medium || 0, color: [251, 191, 36] },
      { label: 'Low Risk / סיכון נמוך', value: data.riskDistribution?.low || 0, color: [34, 197, 94] },
    ];

    riskDist.forEach(item => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      pdf.rect(margin, yPosition - 3, 4, 4, 'F');

      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label + ':', margin + 6, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(item.value), margin + 70, yPosition);
      yPosition += 7;
    });

    yPosition += 5;

    // Performance Trends
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Performance Trends / מגמות ביצועים', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(52, 58, 64);
    const trends = [
      { label: 'Improving / משתפרים', value: data.performanceTrends?.improving || 0, icon: '↗' },
      { label: 'Stable / יציבים', value: data.performanceTrends?.stable || 0, icon: '→' },
      { label: 'Declining / יורדים', value: data.performanceTrends?.declining || 0, icon: '↘' },
    ];

    trends.forEach(item => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`${item.icon} ${item.label}: ${item.value}`, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Emotional Health
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(33, 37, 41);
    pdf.text('Emotional Health / בריאות נפשית', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setTextColor(52, 58, 64);
    const emotional = [
      { label: 'Positive / חיובי', value: data.emotionalHealth?.positive || 0 },
      { label: 'Neutral / נייטרלי', value: data.emotionalHealth?.neutral || 0 },
      { label: 'Concerning / מדאיג', value: data.emotionalHealth?.concerning || 0 },
    ];

    emotional.forEach(item => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`${item.label}: ${item.value}`, margin, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Top Strengths
    if (data.topStrengths && data.topStrengths.length > 0) {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(33, 37, 41);
      pdf.text('Top Strengths / חוזקות מובילות', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(52, 58, 64);
      data.topStrengths.slice(0, 10).forEach((strength: any, index: number) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(`${index + 1}. ${strength.strength} (${strength.count} students)`, margin, yPosition);
        yPosition += 6;
      });
    }

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Generated by ISHEBOT Analytics System', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const filename = `analytics_report_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}

/**
 * Capture element as image and add to PDF
 */
export async function captureElementToPDF(
  elementId: string,
  pdf: jsPDF,
  yPosition: number,
  options: { width?: number; height?: number } = {}
): Promise<number> {
  const element = document.getElementById(elementId);
  if (!element) return yPosition;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = options.width || 170;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if we need a new page
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (yPosition + imgHeight > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
    return yPosition + imgHeight + 10;
  } catch (error) {
    console.error('Error capturing element:', error);
    return yPosition;
  }
}
