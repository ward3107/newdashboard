import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Grid3x3,
  Circle,
  Square,
  Shuffle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  User,
  GripVertical,
  Armchair,
  DoorOpen,
  Wind,
  X,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Brain,
  Heart,
  BookOpen,
  Zap
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { solveSeatingCSP, calculateDeskPairCompatibility } from '../../utils/seatingOptimizer';

// ============================================================================
// SEATING SHAPE CONFIGURATIONS
// ============================================================================

const SEATING_SHAPES = {
  rows: {
    id: 'rows',
    name: 'שורות מסורתיות',
    icon: Grid3x3,
    description: 'סידור מסורתי בשורות - מתאים להרצאות ולמידה עצמאית',
    benefits: ['ריכוז גבוה', 'שקט בכיתה', 'מתאים למבחנים'],
    bestFor: 'למידה עצמאית, מבחנים, הרצאות',
    layout: 'grid',
    rows: 4,
    cols: 4,
    emoji: '📚',
    capacity: 32 // 4x4 desks = 16 desks x 2 students = 32 students
  },
  uShape: {
    id: 'uShape',
    name: 'צורת פרסה (U)',
    icon: Circle,
    description: 'סידור בצורת U - מעודד דיונים והשתתפות',
    benefits: ['תקשורת חזותית', 'דיונים קבוצתיים', 'נגישות למורה'],
    bestFor: 'דיונים, פעילויות קבוצתיות, סמינרים',
    layout: 'uShape',
    positions: 32,
    emoji: '💬',
    capacity: 32
  },
  clusters: {
    id: 'clusters',
    name: 'אשכולות (קבוצות)',
    icon: Users,
    description: 'שולחנות מקובצים - מעודד עבודה צוותית',
    benefits: ['שיתוף פעולה', 'למידה עמיתים', 'עבודת צוות'],
    bestFor: 'פרויקטים, עבודה צוותית, למידה שיתופית',
    layout: 'clusters',
    clusters: 8,
    studentsPerCluster: 4,
    emoji: '👥',
    capacity: 32 // 8 clusters x 4 students = 32 students
  },
  circle: {
    id: 'circle',
    name: 'מעגל',
    icon: Circle,
    description: 'סידור במעגל - מעודד שוויון והשתתפות',
    benefits: ['שוויון', 'דיון פתוח', 'קשר עין'],
    bestFor: 'דיונים סוקרטיים, שיתוף רגשי, בניית קהילה',
    layout: 'circle',
    positions: 32,
    emoji: '⭕',
    capacity: 32
  },
  flexible: {
    id: 'flexible',
    name: 'גמיש (תחנות)',
    icon: Shuffle,
    description: 'תחנות למידה גמישות - מתאים להוראה מותאמת אישית',
    benefits: ['גמישות', 'למידה עצמאית', 'מגוון פעילויות'],
    bestFor: 'למידה מותאמת אישית, תחנות, פעילויות מגוונות',
    layout: 'flexible',
    stations: 4,
    emoji: '🎯',
    capacity: 32 // 4 stations x ~8 students = 32 students
  }
};

// ============================================================================
// AI RECOMMENDATION ENGINE
// ============================================================================

const analyzeClassForSeating = (students) => {
  if (!students || students.length === 0) {
    return {
      recommendedShape: 'rows',
      score: 0,
      reasoning: 'אין תלמידים מנותחים',
      alternatives: []
    };
  }

  // Analyze student characteristics
  const analysis = {
    totalStudents: students.length,
    behavioralChallenges: 0,
    socialLearners: 0,
    independentLearners: 0,
    needsSupport: 0,
    highPerformers: 0,
    collaborators: 0
  };

  students.forEach(student => {
    // Analyze based on student data
    if (student.challengesCount > 3) analysis.behavioralChallenges++;
    if (student.strengthsCount > 4) analysis.highPerformers++;

    // Parse learning style from analysis
    const learningStyle = student.learningStyle || student.keyNotes || '';
    if (learningStyle.includes('חברתי') || learningStyle.includes('קבוצה')) {
      analysis.socialLearners++;
      analysis.collaborators++;
    }
    if (learningStyle.includes('עצמאי') || learningStyle.includes('בודד')) {
      analysis.independentLearners++;
    }
    if (student.needsAnalysis || student.challengesCount > 5) {
      analysis.needsSupport++;
    }
  });

  // Calculate percentages
  const total = analysis.totalStudents;
  const socialPercent = (analysis.socialLearners / total) * 100;
  const independentPercent = (analysis.independentLearners / total) * 100;
  const challengesPercent = (analysis.behavioralChallenges / total) * 100;
  const collaborationPercent = (analysis.collaborators / total) * 100;

  // Determine best shape based on class profile
  let recommendedShape = 'rows';
  let score = 0;
  let reasoning = '';
  const alternatives = [];

  // Decision logic
  if (socialPercent > 60 && collaborationPercent > 50) {
    recommendedShape = 'clusters';
    score = 95;
    reasoning = `${Math.round(socialPercent)}% מהתלמידים הם לומדים חברתיים ומעדיפים עבודה קבוצתית. סידור באשכולות ימקסם למידה שיתופית.`;
    alternatives.push({ shape: 'uShape', score: 85, reason: 'מתאים לדיונים ולמידה אינטראקטיבית' });
    alternatives.push({ shape: 'circle', score: 75, reason: 'מעודד שיתוף והשתתפות שוויונית' });
  } else if (challengesPercent > 40 || analysis.needsSupport > total * 0.3) {
    recommendedShape = 'rows';
    score = 90;
    reasoning = `${Math.round(challengesPercent)}% מהתלמידים מציגים אתגרים התנהגותיים. סידור בשורות יאפשר ריכוז טוב יותר ובקרה של המורה.`;
    alternatives.push({ shape: 'uShape', score: 70, reason: 'נגישות למורה לכל התלמידים' });
  } else if (independentPercent > 50) {
    recommendedShape = 'rows';
    score = 88;
    reasoning = `${Math.round(independentPercent)}% מהתלמידים מעדיפים למידה עצמאית. סידור מסורתי יתמוך בסגנון הלמידה שלהם.`;
    alternatives.push({ shape: 'flexible', score: 80, reason: 'תחנות למידה עצמאית מגוונות' });
  } else if (analysis.highPerformers > total * 0.4) {
    recommendedShape = 'uShape';
    score = 92;
    reasoning = `הכיתה מכילה ${Math.round((analysis.highPerformers / total) * 100)}% תלמידים מצטיינים. סידור בפרסה יעודד דיונים ברמה גבוהה.`;
    alternatives.push({ shape: 'circle', score: 85, reason: 'דיונים סוקרטיים ולמידה עמיתים' });
    alternatives.push({ shape: 'clusters', score: 80, reason: 'למידה שיתופית מתקדמת' });
  } else {
    // Balanced class
    recommendedShape = 'clusters';
    score = 85;
    reasoning = 'הכיתה מאוזנת עם סגנונות למידה מגוונים. אשכולות יאפשרו גמישות ושיתוף פעולה.';
    alternatives.push({ shape: 'uShape', score: 80, reason: 'מתאים לפעילויות מגוונות' });
  }

  return {
    recommendedShape,
    score,
    reasoning,
    alternatives,
    analysis
  };
};

// ============================================================================
// GENERATE OPTIMAL SEATING ARRANGEMENT
// ============================================================================

const generateOptimalSeating = (students, shapeId) => {
  if (!students || students.length === 0) return [];

  const shape = SEATING_SHAPES[shapeId];
  const arrangement = [];

  // INTELLIGENT SORTING: Sort students by their needs for strategic placement
  const sortedStudents = [...students].sort((a, b) => {
    // Priority 1: Students with high challenges (>4) go to front
    const aChallenges = a.challengesCount || 0;
    const bChallenges = b.challengesCount || 0;

    if (aChallenges > 4 && bChallenges <= 4) return -1;  // a goes first (front)
    if (bChallenges > 4 && aChallenges <= 4) return 1;   // b goes first (front)

    // Priority 2: High performers with leadership (strengths >4) also go to front or middle
    const aStrengths = a.strengthsCount || 0;
    const bStrengths = b.strengthsCount || 0;

    // Priority 3: Very high performers (strengths >4) can go to back (independent)
    if (aStrengths > 4 && aChallenges <= 2) return 1;   // a goes to back
    if (bStrengths > 4 && bChallenges <= 2) return -1;  // b goes to back

    // Priority 4: Balanced students (3-4 strengths/challenges) in middle
    return 0; // Keep relative order for middle rows
  });

  // Generate arrangement based on shape
  switch (shape.layout) {
    case 'grid': // Rows - Strategic placement
      const totalSeats = shape.rows * shape.cols;
      const frontRowStudents = [];
      const middleRowStudents = [];
      const backRowStudents = [];

      // Categorize students by where they should sit
      sortedStudents.forEach(student => {
        const challenges = student.challengesCount || 0;
        const strengths = student.strengthsCount || 0;

        // Front row: High challenges OR students needing support
        if (challenges > 4 || (challenges > 2 && strengths < 3)) {
          frontRowStudents.push(student);
        }
        // Back row: High performers with independence
        else if (strengths > 4 && challenges <= 2) {
          backRowStudents.push(student);
        }
        // Middle row: Everyone else (balanced students)
        else {
          middleRowStudents.push(student);
        }
      });

      // Place students row by row
      let studentIndex = 0;
      for (let row = 0; row < shape.rows; row++) {
        for (let col = 0; col < shape.cols; col++) {
          let student = null;

          // Front rows get high-need students
          if (row === 0 || row === 1) {
            if (frontRowStudents.length > 0) {
              student = frontRowStudents.shift();
            } else if (middleRowStudents.length > 0) {
              student = middleRowStudents.shift();
            } else if (backRowStudents.length > 0) {
              student = backRowStudents.shift();
            }
          }
          // Back rows get independent high performers
          else if (row === shape.rows - 1 || row === shape.rows - 2) {
            if (backRowStudents.length > 0) {
              student = backRowStudents.shift();
            } else if (middleRowStudents.length > 0) {
              student = middleRowStudents.shift();
            } else if (frontRowStudents.length > 0) {
              student = frontRowStudents.shift();
            }
          }
          // Middle rows get balanced students
          else {
            if (middleRowStudents.length > 0) {
              student = middleRowStudents.shift();
            } else if (frontRowStudents.length > 0) {
              student = frontRowStudents.shift();
            } else if (backRowStudents.length > 0) {
              student = backRowStudents.shift();
            }
          }

          if (student) {
            arrangement.push({
              id: `${row}-${col}`,
              row,
              col,
              student,
              reasoning: getPlacementReasoning(student, row, col, shape.rows)
            });
          }
        }
      }
      break;

    case 'clusters':
      const studentsPerCluster = Math.ceil(sortedStudents.length / shape.clusters);
      const remainingStudents = [...sortedStudents];
      for (let cluster = 0; cluster < shape.clusters; cluster++) {
        const clusterStudents = [];
        for (let i = 0; i < studentsPerCluster && remainingStudents.length > 0; i++) {
          const student = remainingStudents.shift();
          clusterStudents.push(student);
        }
        arrangement.push({
          id: `cluster-${cluster}`,
          type: 'cluster',
          cluster,
          students: clusterStudents,
          reasoning: getClusterReasoning(clusterStudents)
        });
      }
      break;

    case 'uShape':
    case 'circle':
      // Arrange in circular/U pattern
      sortedStudents.forEach((student, index) => {
        arrangement.push({
          id: `pos-${index}`,
          position: index,
          student,
          reasoning: getCircularReasoning(student, index, sortedStudents.length)
        });
      });
      break;

    case 'flexible':
      // Divide into flexible stations
      const stationSize = Math.ceil(sortedStudents.length / shape.stations);
      const flexibleStudents = [...sortedStudents];
      for (let station = 0; station < shape.stations; station++) {
        const stationStudents = [];
        for (let i = 0; i < stationSize && flexibleStudents.length > 0; i++) {
          stationStudents.push(flexibleStudents.shift());
        }
        arrangement.push({
          id: `station-${station}`,
          type: 'station',
          station,
          students: stationStudents,
          reasoning: `תחנה ${station + 1} - למידה עצמאית ופעילויות מגוונות`
        });
      }
      break;

    default:
      break;
  }

  return arrangement;
};

// Generate detailed AI reasoning for student placement
const generateDetailedPlacementReason = (student, row, col, totalRows) => {
  const strengths = student.strengthsCount || 0;
  const challenges = student.challengesCount || 0;
  const studentName = student.name || `תלמיד ${student.studentCode}`;

  // Extract rich analysis data from student object
  const learningStyle = student.learningStyle || student.keyNotes || '';
  const behaviorNotes = student.behaviorNotes || student.behaviorDescription || '';
  const emotionalState = student.emotionalState || student.emotionalNotes || '';
  const academicNeeds = student.academicNeeds || student.specialNeeds || '';
  const socialSkills = student.socialSkills || student.socialBehavior || '';
  const keyStrengths = student.keyStrengths || student.strengths || '';
  const keyChallenges = student.keyChallenges || student.challenges || '';

  // Extract specific traits from analysis
  const analysisText = student.analysis || student.aiAnalysis || student.fullAnalysis || '';

  let mainReason = '';
  let details = [];
  let basedOn = [];

  // Analyze position
  const isFrontRow = row === 0;
  const isBackRow = row === totalRows - 1;
  const isMiddleRow = !isFrontRow && !isBackRow;
  const isNearWindow = col === 0;
  const isNearDoor = col === totalRows - 1;

  // Front row placement
  if (isFrontRow) {
    if (challenges > 4) {
      // Extract specific behavioral challenges from analysis
      const hasFocusIssues = analysisText.includes('ריכוז') || behaviorNotes.includes('ריכוז') || keyChallenges.includes('ריכוז');
      const hasEmotionalNeeds = emotionalState.includes('חרדה') || emotionalState.includes('תמיכה') || analysisText.includes('רגשי');
      const needsAttention = behaviorNotes.includes('תשומת לב') || analysisText.includes('זקוק לתמיכה');

      if (hasEmotionalNeeds) {
        mainReason = `מיקום קדמי מומלץ - ${studentName} זקוק לתמיכה רגשית ונוכחות מורה קרובה`;
        details.push('💗 נמצא במצב רגשי הדורש תשומת לב מיוחדת');
      } else if (hasFocusIssues) {
        mainReason = `מיקום קדמי אופטימלי - ${studentName} מתמודד עם קשיי ריכוז`;
        details.push('🎯 מרחק קרוב למורה יפחית הסחות דעת');
      } else {
        mainReason = `מיקום קדמי לתמיכה מיידית - ${studentName} דורש פיקוח צמוד`;
        details.push('📌 קרבה למורה לניטור והדרכה מתמשכת');
      }

      details.push('👁️ קשר עין ישיר עם המורה');
      details.push('🎯 הפחתת הסחות דעת מאחור');

      if (behaviorNotes) basedOn.push(`התנהגות: ${behaviorNotes.substring(0, 40)}...`);
      if (emotionalState) basedOn.push(`מצב רגשי: ${emotionalState.substring(0, 40)}...`);
      basedOn.push(`${challenges} אתגרים מזוהים`);
    } else if (strengths > 4) {
      const isLeader = analysisText.includes('מנהיג') || keyStrengths.includes('מנהיגות') || socialSkills.includes('חברתי');
      const isAcademicStrong = keyStrengths.includes('אקדמי') || analysisText.includes('מצטיין') || academicNeeds.includes('מתקדם');

      if (isLeader) {
        mainReason = `מיקום מוביל אסטרטגי - ${studentName} משמש מודל לחיקוי לכיתה`;
        details.push('👑 תלמיד בעל יכולות מנהיגות מזוהות');
        details.push('💡 יכול להשפיע חיובית על אקלים הכיתה');
      } else if (isAcademicStrong) {
        mainReason = `מיקום קדמי - ${studentName} תלמיד מצטיין שתורם לשיעור`;
        details.push('🎓 הצטיינות אקדמית מזוהה בניתוח');
        details.push('💡 תשובות מהירות ומעודדות לכיתה');
      } else {
        mainReason = `מיקום מוביל - ${studentName} דוגמה חיובית לכיתה`;
        details.push('⭐ תלמיד מצטיין המשמש מודל לחיקוי');
      }

      details.push('🎯 מיקום קדמי מחזק את השפעתו החיובית');

      if (keyStrengths) basedOn.push(`חוזקות: ${keyStrengths.substring(0, 40)}...`);
      if (socialSkills) basedOn.push(`יכולות חברתיות: ${socialSkills.substring(0, 30)}...`);
      basedOn.push(`${strengths} חוזקות מזוהות`);
    } else {
      const isQuiet = analysisText.includes('שקט') || behaviorNotes.includes('ביישן') || socialSkills.includes('מופנם');

      if (isQuiet) {
        mainReason = `מיקום קדמי תומך - ${studentName} זקוק לעידוד להשתתפות`;
        details.push('🤝 תלמיד מופנם/שקט - מיקום קדמי יעודד אותו');
      } else {
        mainReason = `מיקום קדמי לעידוד השתתפות - ${studentName}`;
      }

      details.push('✋ קירוב למורה לעידוד והשתתפות');
      details.push('📚 גישה טובה ללוח והצגות');

      if (learningStyle) basedOn.push(`סגנון למידה: ${learningStyle.substring(0, 35)}...`);
      basedOn.push('צורך בעידוד להשתתפות');
    }
  }

  // Back row placement
  else if (isBackRow) {
    if (strengths > 4) {
      const isIndependent = keyStrengths.includes('עצמאי') || learningStyle.includes('עצמאי') || analysisText.includes('עצמאות');
      const isMature = analysisText.includes('בוגר') || behaviorNotes.includes('אחראי') || keyStrengths.includes('אחריות');

      if (isIndependent) {
        mainReason = `מיקום אחורי אופטימלי - ${studentName} לומד עצמאי ובוגר`;
        details.push('🎯 זוהה כתלמיד עצמאי המסוגל לנהל את למידתו');
        details.push('📖 לא זקוק לפיקוח צמוד - מתפקד מצוין באופן עצמאי');
      } else if (isMature) {
        mainReason = `מיקום אחורי - ${studentName} תלמיד בוגר ואחראי`;
        details.push('💪 בגרות ואחריות מזוהות בניתוח');
        details.push('🎯 מסוגל להתרכז ללא פיקוח צמוד');
      } else {
        mainReason = `מיקום אחורי - ${studentName} בעל ביצועים גבוהים`;
        details.push('🎯 תלמיד עצמאי שלא זקוק לפיקוח צמוד');
        details.push('📖 מסוגל להתרכז ללא עזרה מתמדת');
      }

      details.push('💪 מיקום זה מאפשר ניהול עצמי של הלמידה');

      if (keyStrengths) basedOn.push(`חוזקות: ${keyStrengths.substring(0, 40)}...`);
      if (learningStyle) basedOn.push(`סגנון: ${learningStyle.substring(0, 30)}...`);
      basedOn.push('עצמאות גבוהה');
    } else if (learningStyle.includes('עצמאי')) {
      mainReason = `מיקום אחורי מתאים - ${studentName} מעדיף למידה עצמאית`;
      details.push('🤫 סביבה שקטה יותר מתאימה לסגנון הלמידה');
      details.push('📝 אפשרות לעבוד בקצב אישי');

      basedOn.push(`סגנון למידה: ${learningStyle.substring(0, 40)}...`);
      basedOn.push('למידה עצמאית מועדפת');
    } else {
      const needsMonitoring = challenges > 2 || analysisText.includes('מעקב') || behaviorNotes.includes('הסחות');

      if (needsMonitoring) {
        mainReason = `מיקום אחורי - ${studentName} דורש מעקב והשגחה`;
        details.push('⚠️ חשוב לעקוב ולוודא השתתפות פעילה');
        details.push('👀 מומלצות בדיקות תכופות להבטחת ריכוז');

        if (behaviorNotes) basedOn.push(`התנהגות: ${behaviorNotes.substring(0, 40)}...`);
      } else {
        mainReason = `מיקום אחורי - ${studentName} ביצועים בינוניים`;
        details.push('⚠️ יש לעקוב ולוודא השתתפות פעילה');
        details.push('👀 מומלץ מעקב של המורה');
      }

      basedOn.push('דורש מעקב והשגחה');
    }
  }

  // Middle row placement
  else {
    if (strengths >= 3 && challenges >= 3) {
      const balancedProfile = analysisText.includes('מאוזן') || (keyStrengths && keyChallenges);

      if (balancedProfile) {
        mainReason = `מיקום מאוזן אופטימלי - ${studentName} בעל פרופיל מעורב של חוזקות ואתגרים`;
        details.push('⚖️ מרחק מושלם מהמורה - לא צמוד מדי ולא רחוק מדי');
        details.push('👥 יכול לקבל תמיכה במידת הצורך וגם לפעול עצמאית');
      } else {
        mainReason = `מיקום מאוזן - ${studentName} איזון בין תמיכה לעצמאות`;
        details.push('⚖️ מרחק אופטימלי מהמורה');
        details.push('👥 קרבה לחברים לשיתוף פעולה');
      }

      details.push('🎵 מיקום המאפשר גמישות פדגוגית');

      if (keyStrengths) basedOn.push(`חוזקות: ${keyStrengths.substring(0, 35)}...`);
      if (keyChallenges) basedOn.push(`אתגרים: ${keyChallenges.substring(0, 35)}...`);
      basedOn.push('פרופיל מאוזן');
    } else if (learningStyle.includes('חברתי')) {
      const isSocialLearner = socialSkills.includes('חברתי') || analysisText.includes('עבודה בקבוצות') || keyStrengths.includes('שיתוף פעולה');

      if (isSocialLearner) {
        mainReason = `מיקום מרכזי מושלם - ${studentName} לומד חברתי שמצטיין בעבודת צוות`;
        details.push('👫 זוהה כלומד חברתי - מיקום מרכזי מקסם אינטראקציות');
        details.push('💬 קרבה לתלמידים רבים מעודדת שיתוף פעולה');
        details.push('🤝 יכול להוביל ולהשתתף בפעילויות קבוצתיות');

        basedOn.push(`יכולות חברתיות: ${socialSkills.substring(0, 35)}...`);
      } else {
        mainReason = `מיקום מרכזי - ${studentName} מעדיף אינטראקציה חברתית`;
        details.push('👫 מיקום טוב לעבודה בקבוצות');
        details.push('💬 קרבה לתלמידים רבים');
        details.push('🤝 עידוד שיתוף פעולה');
      }

      basedOn.push(`סגנון למידה: ${learningStyle.substring(0, 40)}...`);
    } else {
      const hasSpecialNeeds = academicNeeds || analysisText.includes('צרכים מיוחדים');

      if (hasSpecialNeeds && academicNeeds) {
        mainReason = `מיקום מרכזי - ${studentName} עם התאמות למידה`;
        details.push('📍 מיקום מרכזי מאפשר גישה נוחה למורה');
        details.push('👀 רואה את הלוח בבירור');
        details.push('🎯 קרבה למשאבי הכיתה');

        basedOn.push(`צרכים: ${academicNeeds.substring(0, 40)}...`);
      } else {
        mainReason = `מיקום מרכזי סטנדרטי - ${studentName}`;
        details.push('📍 מיקום מרכזי בכיתה');
        details.push('👀 רואה את הלוח בבירור');
        details.push('🎯 גישה טובה למורה ולחברים');

        if (learningStyle) basedOn.push(`סגנון למידה: ${learningStyle.substring(0, 35)}...`);
      }

      basedOn.push('מיקום סטנדרטי מאוזן');
    }
  }

  // Additional considerations for window seat
  if (isNearWindow) {
    if (learningStyle.includes('ויזואלי') || learningStyle.includes('חזותי')) {
      details.push(`🪟 קרוב לחלון - ${studentName} לומד חזותי, אור טבעי יועיל ללמידתו`);
      basedOn.push('למידה חזותית מזוהה');
    } else if (challenges > 3) {
      const hasADHD = analysisText.includes('קשב') || behaviorNotes.includes('ADHD') || keyChallenges.includes('ריכוז');
      if (hasADHD) {
        details.push('⚠️ קרוב לחלון - חשוב לנטר ריכוז בשל קשיי קשב מזוהים');
      } else {
        details.push('⚠️ קרוב לחלון - יש להקפיד על ריכוז (הסחות אפשריות)');
      }
    } else {
      details.push('🪟 מיקום ליד החלון - אור טבעי וסביבה נעימה');
    }
  }

  // Additional considerations for door seat
  if (isNearDoor) {
    const needsFrequentBreaks = analysisText.includes('הפסקות') || emotionalState.includes('חרדה') || academicNeeds.includes('תנועה');

    if (needsFrequentBreaks) {
      details.push(`🚪 קרוב לדלת - ${studentName} זקוק להפסקות/תנועה - מיקום נוח`);
      basedOn.push('צורך בהפסקות תכופות');
    } else if (challenges > 3) {
      details.push('🚪 קרוב לדלת - יציאה מהירה במידת הצורך להתערבות');
    } else {
      details.push('🚪 קרוב לדלת - גישה נוחה ויציאה מהירה');
    }
  }

  return {
    mainReason,
    details,
    basedOn
  };
};

// Simplified version for display
const getPlacementReasoning = (student, row, col, totalRows) => {
  const detailed = generateDetailedPlacementReason(student, row, col, totalRows);
  return detailed.mainReason;
};

const getClusterReasoning = (students) => {
  if (!students || students.length === 0) return 'קבוצה ריקה';

  const avgStrengths = students.reduce((sum, s) => sum + (s.strengthsCount || 0), 0) / students.length;
  const avgChallenges = students.reduce((sum, s) => sum + (s.challengesCount || 0), 0) / students.length;

  if (avgStrengths > 4) {
    return 'קבוצה חזקה - יכולה לעבוד על משימות מאתגרות';
  } else if (avgChallenges > 3) {
    return 'קבוצה זקוקה לתמיכה - ממוקמת קרוב למורה';
  } else {
    return 'קבוצה מאוזנת - שילוב של חוזקות ואתגרים';
  }
};

const getPairReasoning = (student1, student2) => {
  if (!student1 || !student2) return 'זוג מאוזן';

  const strengths1 = student1.strengthsCount || 0;
  const strengths2 = student2.strengthsCount || 0;

  if (Math.abs(strengths1 - strengths2) > 3) {
    return 'חונכות עמיתים - תלמיד חזק תומך בתלמיד זקוק לעזרה';
  } else if (strengths1 > 4 && strengths2 > 4) {
    return 'זוג מצטיינים - יכולים לאתגר אחד את השני';
  } else {
    return 'זוג מאוזן - תמיכה הדדית';
  }
};

const getCircularReasoning = (student, index, total) => {
  if (index < total / 4) {
    return 'קרוב למורה - נגישות ישירה';
  } else if (index < total / 2) {
    return 'צד שמאל - מיקום טוב לדיונים';
  } else if (index < (3 * total) / 4) {
    return 'צד ימין - רואה את כל הכיתה';
  } else {
    return 'מול המורה - קשר עין ישיר';
  }
};

// ============================================================================
// STUDENT ANALYSIS POPUP COMPONENT
// ============================================================================

const StudentAnalysisPopup = ({ student, onClose, darkMode = false }) => {
  if (!student) return null;

  const challenges = student.challengesCount || 0;
  const strengths = student.strengthsCount || 0;
  const grade = student.grade || 0;

  // Parse strengths and challenges from analysis
  const getTopItems = (text, count = 3) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(0, count);
  };

  const topStrengths = getTopItems(student.keyStrengths, 3);
  const topChallenges = getTopItems(student.keyChallenges, 3);

  // Determine color scheme
  const getColorScheme = () => {
    if (challenges > 4 || (grade > 0 && grade < 60)) {
      return { bg: 'from-red-500 to-red-600', text: 'סיכון גבוה', emoji: '🔴', icon: AlertCircle };
    }
    if (challenges > 2 || (grade > 0 && grade < 75)) {
      return { bg: 'from-yellow-400 to-orange-500', text: 'דורש תמיכה', emoji: '🟡', icon: Target };
    }
    if (strengths > 4 && challenges <= 2) {
      return { bg: 'from-green-500 to-emerald-600', text: 'מצטיין', emoji: '🟢', icon: Award };
    }
    return { bg: 'from-blue-500 to-purple-500', text: 'מאוזן', emoji: '🔵', icon: CheckCircle };
  };

  const colorScheme = getColorScheme();
  const StatusIcon = colorScheme.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
        style={{ zIndex: 9999999 }}
      >
          {/* Header */}
          <div className={`bg-gradient-to-r ${colorScheme.bg} p-6 relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
            >
              <X className="text-white" size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                {colorScheme.emoji}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {student.name || `תלמיד ${student.studentCode}`}
                </h2>
                <p className="text-white/80 text-sm mb-2">קוד: {student.studentCode}</p>
                <div className="flex items-center gap-2">
                  <StatusIcon className="text-white" size={16} />
                  <span className="text-white font-semibold">{colorScheme.text}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
                <Award className={`mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {strengths}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>חוזקות</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
                <Target className={`mx-auto mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={24} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {challenges}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>אתגרים</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
                <TrendingUp className={`mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {grade > 0 ? `${grade}%` : 'N/A'}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ציון</div>
              </div>
            </div>

            {/* Top 3 Strengths */}
            {topStrengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-green-500" size={20} />
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    חוזקות מרכזיות
                  </h3>
                </div>
                <div className="space-y-2">
                  {topStrengths.map((strength, index) => (
                    <div
                      key={index}
                      className={`${
                        darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                      } border rounded-xl p-3 flex items-start gap-3`}
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right flex-1`}>
                        {strength}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top 3 Challenges */}
            {topChallenges.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-orange-500" size={20} />
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    אתגרים מרכזיים
                  </h3>
                </div>
                <div className="space-y-2">
                  {topChallenges.map((challenge, index) => (
                    <div
                      key={index}
                      className={`${
                        darkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
                      } border rounded-xl p-3 flex items-start gap-3`}
                    >
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right flex-1`}>
                        {challenge}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seating Strategy */}
            <div className={`${darkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="text-purple-500" size={20} />
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  אסטרטגיית ישיבה מומלצת
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                {challenges > 4 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ מיקום בשורה קדמית לניטור קרוב
                  </p>
                )}
                {challenges > 4 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ ליד תלמיד חזק לחונכות עמיתים
                  </p>
                )}
                {strengths > 4 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ יכול לשבת בשורות אחוריות (עצמאי)
                  </p>
                )}
                {strengths > 4 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ מומלץ לשיבוץ כמנטור לתלמידים אחרים
                  </p>
                )}
                {challenges <= 4 && strengths <= 4 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ מיקום מרכזי מאוזן
                  </p>
                )}
              </div>
            </div>

            {/* View Full Analysis Button */}
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => {
                // This would navigate to full analysis - placeholder for now
                console.log('View full analysis for', student.studentCode);
              }}
            >
              <BookOpen size={18} />
              <span>צפה בניתוח מלא</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
  );
};

// ============================================================================
// STUDENT INFO SIDE PANEL COMPONENT
// ============================================================================

const StudentInfoPanel = ({ studentData, onClose, darkMode = false, selectedShape = 'rows', cspMetadata = null, arrangement = [], onOpenDeskPopup = null }) => {
  if (!studentData) return null;

  const student = studentData.student || studentData; // Support both formats
  const row = studentData.row !== undefined ? studentData.row : null;
  const col = studentData.col !== undefined ? studentData.col : null;
  const totalRows = studentData.totalRows || 4;

  // Find desk partner and compatibility
  const findDeskPartner = () => {
    if (!arrangement || arrangement.length === 0) return null;

    // Find the desk that contains this student
    const desk = arrangement.find(item => {
      if (!item) return false;
      const leftMatch = item.leftStudent && item.leftStudent.studentCode === student.studentCode;
      const rightMatch = item.rightStudent && item.rightStudent.studentCode === student.studentCode;
      const singleMatch = item.student && item.student.studentCode === student.studentCode;
      return leftMatch || rightMatch || singleMatch;
    });

    if (!desk) return null;

    // Determine the partner
    let partner = null;
    if (desk.leftStudent && desk.leftStudent.studentCode === student.studentCode) {
      partner = desk.rightStudent;
    } else if (desk.rightStudent && desk.rightStudent.studentCode === student.studentCode) {
      partner = desk.leftStudent;
    }

    return {
      partner,
      compatibility: desk.compatibility,
      deskInfo: desk
    };
  };

  const deskPartnerInfo = findDeskPartner();

  const challenges = student.challengesCount || 0;
  const strengths = student.strengthsCount || 0;
  const grade = student.grade || 0;

  // Add keyboard listener for Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Parse strengths and challenges from analysis
  const getTopItems = (text, count = 3) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.slice(0, count);
  };

  const topStrengths = getTopItems(student.keyStrengths, 3);
  const topChallenges = getTopItems(student.keyChallenges, 3);

  // Determine color scheme
  const getColorScheme = () => {
    if (challenges > 4 || (grade > 0 && grade < 60)) {
      return { bg: 'from-red-500 to-red-600', text: 'סיכון גבוה', emoji: '🔴', icon: AlertCircle };
    }
    if (challenges > 2 || (grade > 0 && grade < 75)) {
      return { bg: 'from-yellow-400 to-orange-500', text: 'דורש תמיכה', emoji: '🟡', icon: Target };
    }
    if (strengths > 4 && challenges <= 2) {
      return { bg: 'from-green-500 to-emerald-600', text: 'מצטיין', emoji: '🟢', icon: Award };
    }
    return { bg: 'from-blue-500 to-purple-500', text: 'מאוזן', emoji: '🔵', icon: CheckCircle };
  };

  const colorScheme = getColorScheme();
  const StatusIcon = colorScheme.icon;

  // Get AI reasoning based on layout type and ACTUAL POSITION
  const getAIReasoning = () => {
    const items = [];

    // ONLY use position data if we're in ROWS layout (grid) - other layouts don't have meaningful row/col
    const isRowsLayout = selectedShape === 'rows';
    const hasValidPosition = row !== null && row !== undefined && isRowsLayout;

    // Determine position in classroom (ONLY for rows layout)
    const isFrontRow = hasValidPosition && row <= 1;
    const isMiddleRow = hasValidPosition && row > 1 && row < totalRows - 1;
    const isBackRow = hasValidPosition && row >= totalRows - 1;
    const rowPosition = hasValidPosition ? `שורה ${row + 1} מתוך ${totalRows}` : '';

    if (selectedShape === 'rows' && cspMetadata) {
      // Show CSP-based reasoning for rows layout
      const studentMetadata = cspMetadata.students?.[student.studentCode];
      if (studentMetadata) {
        items.push(`ציון איכות מיקום: ${(studentMetadata.qualityScore * 100).toFixed(1)}%`);
        items.push(`תאימות עם שכן: ${studentMetadata.compatibility ? (studentMetadata.compatibility * 100).toFixed(1) + '%' : 'N/A'}`);
        if (studentMetadata.deskPair) {
          items.push(`זוג שולחן: #${studentMetadata.deskPair.desk1} ו-#${studentMetadata.deskPair.desk2}`);
        }
      }
    }

    // Add ACTUAL position information (ONLY for rows layout with valid position)
    if (rowPosition && hasValidPosition) {
      items.push(`📍 מיקום בכיתה: ${rowPosition}`);
    }

    // Generate personalized reasoning based on student profile
    const languageLevel = student.languageLevel || 'לא ידוע';
    const hasHighChallenges = challenges > 4;
    const hasModChallenges = challenges > 2 && challenges <= 4;
    const hasHighStrengths = strengths > 4;
    const hasModStrengths = strengths > 2 && strengths <= 4;
    const hasLowGrade = grade > 0 && grade < 60;
    const hasMedGrade = grade >= 60 && grade < 75;
    const hasHighGrade = grade >= 75;

    // POSITION-AWARE reasoning ONLY for rows layout with valid position
    if (hasValidPosition) {
      if (isFrontRow) {
        items.push('🎯 ממוקם בשורות הקדמיות - קרוב למורה');
        if (hasHighChallenges) {
          items.push(`✓ תלמיד עם ${challenges} אתגרים - מיקום קדמי מתאים לניטור צמוד`);
          items.push('✓ קל למורה לזהות קשיים ולתת תמיכה מיידית');
        } else if (hasHighStrengths) {
          items.push(`✓ תלמיד מצטיין (${strengths} חוזקות) בשורה קדמית - משאב לכיתה`);
          items.push('✓ יכול לסייע במענה על שאלות ולהוות דוגמה');
        } else {
          items.push('✓ מיקום קדמי מאפשר ריכוז גבוה והתמקדות');
        }
      } else if (isBackRow) {
        items.push('🎯 ממוקם בשורות האחוריות - רחוק מהמורה');
        if (hasHighChallenges) {
          items.push(`⚠️ שים לב: תלמיד עם ${challenges} אתגרים - עלול להזדקק למעקב צמוד יותר`);
          items.push('💡 שקול העברה לשורה קדמית יותר לשיפור התמיכה');
        } else if (hasHighStrengths) {
          items.push(`✓ תלמיד עצמאי (${strengths} חוזקות) - מתאים לשורה אחורית`);
          items.push('✓ יכול לעבוד באופן עצמאי ללא ניטור צמוד');
        } else {
          items.push('✓ מיקום אחורי מתאים לתלמידים עצמאיים');
        }
      } else if (isMiddleRow) {
        items.push('🎯 ממוקם בשורות האמצעיות - מרחק מאוזן מהמורה');
        if (hasHighChallenges) {
          items.push(`תלמיד עם ${challenges} אתגרים - שקול העברה לשורה קדמית יותר`);
        } else if (hasHighStrengths) {
          items.push(`✓ תלמיד מאוזן (${strengths} חוזקות) - מיקום מרכזי מתאים`);
        } else {
          items.push('✓ מיקום מאוזן - מתאים לרוב התלמידים');
        }
      }
    } else {
      // Generic student profile analysis for non-rows layouts
      if (hasHighChallenges && hasHighStrengths) {
        items.push(`📊 פרופיל מורכב: ${strengths} חוזקות + ${challenges} אתגרים`);
        items.push('✓ תלמיד עם יכולות גבוהות אבל צרכים מיוחדים');
      } else if (hasHighChallenges) {
        items.push(`⚠️ תלמיד עם ${challenges} אתגרים - זקוק לתמיכה ומעקב`);
        if (selectedShape === 'circle' || selectedShape === 'uShape') {
          items.push('✓ סידור מעגלי מאפשר למורה לראות את כל התלמידים');
        }
      } else if (hasHighStrengths) {
        items.push(`🌟 תלמיד מצטיין עם ${strengths} חוזקות`);
        items.push('✓ יכול לסייע לתלמידים אחרים ולהוות משאב לכיתה');
      } else if (hasModChallenges || hasModStrengths) {
        items.push(`📊 פרופיל מאוזן: ${strengths} חוזקות, ${challenges} אתגרים`);
      }
    }

    // Personalized reasoning based on grade
    if (hasLowGrade) {
      items.push(`📊 ציון נמוך (${grade}%) - דורש תשומת לב והתערבות`);
    } else if (hasMedGrade) {
      items.push(`📊 ציון בינוני (${grade}%) - פוטנציאל לשיפור`);
    } else if (hasHighGrade) {
      items.push(`📊 ציון גבוה (${grade}%) - תלמיד מצליח`);
    }

    // Personalized reasoning based on language level
    if (languageLevel && languageLevel !== 'לא ידוע') {
      items.push(`🗣️ רמת שפה: ${languageLevel}`);
    }

    // Add layout-specific reasoning
    if (selectedShape === 'clusters') {
      items.push('👥 סידור באשכולות לעבודה קבוצתית ולמידה שיתופית');
      if (hasHighChallenges) {
        items.push('💡 מומלץ לשבץ עם תלמידים תומכים באשכול');
      }
    } else if (selectedShape === 'circle' || selectedShape === 'uShape') {
      items.push('⭕ סידור מעגלי - כל התלמידים במרחק שווה מהמורה');
      items.push('✓ מאפשר ראייה ואינטראקציה שווה עם כל התלמידים');
    } else if (selectedShape === 'stations') {
      items.push('🚉 סידור בתחנות ללמידה גמישה ועצמאית');
      if (hasHighStrengths) {
        items.push('✓ מתאים לתלמידים עצמאיים');
      } else if (hasHighChallenges) {
        items.push('💡 עלול להזדקק לתמיכה נוספת בלמידה עצמאית');
      }
    }

    return {
      type: selectedShape === 'rows' && cspMetadata ? 'CSP Genetic Algorithm' : 'Personalized Placement',
      title: selectedShape === 'rows' && cspMetadata ? 'ניתוח אלגוריתם גנטי (CSP)' : 'ניתוח פרופיל התלמיד',
      icon: selectedShape === 'rows' && cspMetadata ? Brain : Sparkles,
      items: items.filter(Boolean)
    };
  };

  const aiReasoning = getAIReasoning();
  const AIIcon = aiReasoning.icon;

  // Render panel in a portal at document body level to ensure it's above everything
  const panelContent = (
    <div className="fixed inset-0 z-[9999999]" style={{ pointerEvents: 'none' }}>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40"
        style={{ pointerEvents: 'auto' }}
        aria-label="Close panel"
      />

      {/* Side panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 h-full w-96 ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        } shadow-2xl overflow-y-auto`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorScheme.bg} p-6 relative sticky top-0`}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 group"
            aria-label="סגור חלונית"
          >
            <X className="text-white drop-shadow-md group-hover:rotate-90 transition-transform" size={24} />
          </button>

          <div className="flex items-start gap-4 mt-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              {colorScheme.emoji}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {student.name || `תלמיד ${student.studentCode}`}
              </h2>
              <p className="text-white/80 text-sm mb-2">קוד: {student.studentCode}</p>
              <div className="flex items-center gap-2">
                <StatusIcon className="text-white" size={16} />
                <span className="text-white font-semibold text-sm">{colorScheme.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <Award className={`mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} size={20} />
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {strengths}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>חוזקות</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <Target className={`mx-auto mb-1 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} size={20} />
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {challenges}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>אתגרים</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-3 text-center`}>
              <TrendingUp className={`mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} size={20} />
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {grade > 0 ? `${grade}%` : 'N/A'}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ציון</div>
            </div>
          </div>

          {/* Desk Partner Section */}
          {deskPartnerInfo && deskPartnerInfo.partner && (
            <div className={`${darkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-purple-500" size={20} />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  שותף לשולחן
                </h3>
              </div>

              <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-lg p-3 mb-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {deskPartnerInfo.partner.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {deskPartnerInfo.partner.studentCode}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ✓ {deskPartnerInfo.partner.strengthsCount || 0} חוזקות
                  </span>
                  <span className={`${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    ⚠ {deskPartnerInfo.partner.challengesCount || 0} אתגרים
                  </span>
                </div>
              </div>

              {deskPartnerInfo.compatibility && deskPartnerInfo.compatibility.score !== undefined && (
                <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-lg p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-pink-500" />
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        תואמות
                      </span>
                    </div>
                    <span className={`text-xl font-bold ${
                      deskPartnerInfo.compatibility.score > 75 ? 'text-green-500' :
                      deskPartnerInfo.compatibility.score > 60 ? 'text-yellow-500' :
                      deskPartnerInfo.compatibility.score > 40 ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {deskPartnerInfo.compatibility.score}%
                    </span>
                  </div>
                  {deskPartnerInfo.compatibility.reasons && deskPartnerInfo.compatibility.reasons.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {deskPartnerInfo.compatibility.reasons.slice(0, 2).map((reason, idx) => (
                        <p key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          • {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  if (onOpenDeskPopup && deskPartnerInfo.deskInfo && deskPartnerInfo.deskInfo.id) {
                    onClose();
                    setTimeout(() => {
                      onOpenDeskPopup(deskPartnerInfo.deskInfo.id);
                    }, 300); // Wait for sidebar to close
                  }
                }}
                className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Info size={16} />
                הצג ניתוח שולחן מלא
              </button>
            </div>
          )}

          {deskPartnerInfo && !deskPartnerInfo.partner && (
            <div className={`${darkMode ? 'bg-gray-500/10 border-gray-500/30' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4`}>
              <div className="flex items-center gap-2">
                <Users className="text-gray-500" size={20} />
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  תלמיד זה יושב לבד
                </p>
              </div>
            </div>
          )}

          {/* AI Reasoning Section - Shows ACTUAL analysis based on layout type */}
          <div className={`${darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <AIIcon className="text-blue-500" size={20} />
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {aiReasoning.title}
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {aiReasoning.items.map((item, index) => (
                <p key={index} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                  • {item}
                </p>
              ))}
            </div>
            <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-right italic`}>
              {aiReasoning.type === 'CSP Genetic Algorithm'
                ? '* מבוסס על אלגוריתם גנטי מתקדם (CSP)'
                : '* סידור פשוט עם גיוון אקראי'}
            </div>
          </div>

          {/* Top 3 Strengths */}
          {topStrengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-green-500" size={18} />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  חוזקות מרכזיות
                </h3>
              </div>
              <div className="space-y-2">
                {topStrengths.map((strength, index) => (
                  <div
                    key={index}
                    className={`${
                      darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                    } border rounded-lg p-2 flex items-start gap-2`}
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right flex-1`}>
                      {strength}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 3 Challenges */}
          {topChallenges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-orange-500" size={18} />
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  אתגרים מרכזיים
                </h3>
              </div>
              <div className="space-y-2">
                {topChallenges.map((challenge, index) => (
                  <div
                    key={index}
                    className={`${
                      darkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
                    } border rounded-lg p-2 flex items-start gap-2`}
                  >
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right flex-1`}>
                      {challenge}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seating Strategy */}
          <div className={`${darkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="text-purple-500" size={18} />
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                אסטרטגיית ישיבה מומלצת
              </h3>
            </div>
            <div className="space-y-1 text-xs">
              {challenges > 4 && (
                <>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ מיקום בשורה קדמית לניטור קרוב
                  </p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ ליד תלמיד חזק לחונכות עמיתים
                  </p>
                </>
              )}
              {strengths > 4 && (
                <>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ יכול לשבת בשורות אחוריות (עצמאי)
                  </p>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                    ✓ מומלץ לשיבוץ כמנטור לתלמידים אחרים
                  </p>
                </>
              )}
              {challenges <= 4 && strengths <= 4 && (
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right`}>
                  ✓ מיקום מרכזי מאוזן
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} rounded-xl p-4 space-y-2`}>
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
              <Sparkles size={16} className="text-yellow-500" />
              פעולות מהירות
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {/* View Partner Profile - Only show if has partner */}
              {deskPartnerInfo && deskPartnerInfo.partner && (
                <button
                  onClick={() => {
                    // Open partner's profile
                    const partnerData = { ...deskPartnerInfo.partner, row, col, totalRows };
                    onClose();
                    setTimeout(() => {
                      // Reopen sidebar with partner data
                      // This would need to be passed from parent, for now just close
                    }, 100);
                  }}
                  className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1`}
                >
                  <User size={14} />
                  פרופיל שותף
                </button>
              )}

              {/* Shuffle/Swap placeholder */}
              <button
                onClick={() => {
                  alert('תכונת החלפה תהיה זמינה בקרוב');
                }}
                className={`${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1`}
              >
                <Shuffle size={14} />
                החלף תלמיד
              </button>

              {/* Move to front - only for rows layout */}
              {selectedShape === 'rows' && row !== null && row > 1 && (
                <button
                  onClick={() => {
                    alert('תכונת העברה תהיה זמינה בקרוב');
                  }}
                  className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1`}
                >
                  <TrendingUp size={14} />
                  העבר קדימה
                </button>
              )}

              {/* Refresh/Regenerate */}
              <button
                onClick={() => {
                  alert('יצירת סידור חדש תתבצע בקרוב');
                }}
                className={`${darkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1`}
              >
                <RefreshCw size={14} />
                סדר מחדש
              </button>
            </div>

            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center mt-2`}>
              💡 פעולות אלו ישנו את סידור הכיתה
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Use portal to render at document body level, bypassing any stacking context issues
  return ReactDOM.createPortal(panelContent, document.body);
};

// ============================================================================
// DRAGGABLE STUDENT COMPONENT
// ============================================================================

const DraggableStudent = ({ student, onInfo, isDraggable = true, row = 0, col = 0, totalRows = 4, darkMode = false }) => {
  // Safety check - if student is undefined, return null
  if (!student || !student.studentCode) {
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: student.studentCode, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  // Generate detailed AI reasoning for this student's placement
  const placementReason = generateDetailedPlacementReason(student, row, col, totalRows);

  // Debug: Log to verify different positions generate different reasons
  console.log(`Student ${student.studentCode} at row ${row}, col ${col} | Strengths: ${student.strengthsCount || 0}, Challenges: ${student.challengesCount || 0}:`, placementReason.mainReason);

  // Determine student color based on needs and performance
  const getStudentColor = () => {
    const challenges = student.challengesCount || 0;
    const strengths = student.strengthsCount || 0;
    const grade = student.grade || 0;
    const riskLevel = student.riskLevel;

    // Red: At-risk/high challenges/low performance
    if (riskLevel === 'high' || challenges > 4 || (grade > 0 && grade < 60)) {
      return {
        gradient: 'from-red-500 to-red-600',
        border: 'border-red-300',
        shadow: 'shadow-red-500/50',
        label: 'סיכון גבוה',
        emoji: '🔴'
      };
    }

    // Yellow: Moderate support needed
    if (challenges > 2 || (grade > 0 && grade < 75) || riskLevel === 'medium') {
      return {
        gradient: 'from-yellow-400 to-orange-500',
        border: 'border-yellow-300',
        shadow: 'shadow-yellow-500/50',
        label: 'דורש תמיכה',
        emoji: '🟡'
      };
    }

    // Green: High performer/independent learner
    if (strengths > 4 && challenges <= 2 && (grade === 0 || grade >= 85)) {
      return {
        gradient: 'from-green-500 to-emerald-600',
        border: 'border-green-300',
        shadow: 'shadow-green-500/50',
        label: 'מצטיין',
        emoji: '🟢'
      };
    }

    // Gray: Not yet analyzed or balanced
    if (student.needsAnalysis || (!strengths && !challenges)) {
      return {
        gradient: 'from-gray-400 to-gray-500',
        border: 'border-gray-300',
        shadow: 'shadow-gray-500/50',
        label: 'לא נותח',
        emoji: '⚪'
      };
    }

    // Blue: Balanced/average student (default)
    return {
      gradient: 'from-blue-500 to-purple-500',
      border: 'border-blue-300',
      shadow: 'shadow-blue-500/50',
      label: 'מאוזן',
      emoji: '🔵'
    };
  };

  const colorScheme = getStudentColor();

  return (
    <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...(isDraggable ? listeners : {})}
        whileHover={{ scale: 1.05 }}
        className="relative group cursor-move"
      >
        <div
          className={`w-16 h-16 rounded-lg bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg ${colorScheme.shadow} border-2 ${colorScheme.border} transition-all relative`}
        >
          <div className="text-center leading-tight pointer-events-none">
            {student.studentCode.toString()}
          </div>
          {isDraggable && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center pointer-events-none">
              <GripVertical className="text-gray-600" size={10} />
            </div>
          )}
          {/* Color indicator badge */}
          <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200 shadow-sm pointer-events-none">
            {colorScheme.emoji}
          </div>

          {/* Info button overlay - separate from drag area */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onInfo) {
                onInfo({ student, row, col, totalRows });
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent drag from starting
            }}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 hover:opacity-100 hover:bg-white/20 rounded-lg transition-all flex items-center justify-center group"
            aria-label={`View details for student ${student.studentCode}`}
            style={{ zIndex: 10 }}
          >
            <Info className="text-white drop-shadow-lg" size={20} />
          </button>
        </div>

      {/* Disabled individual student hover tooltip - now using desk-level tooltip instead */}
    </motion.div>
  );
};

// ============================================================================
// SIMPLE ARRANGEMENT GENERATOR (for non-rows layouts)
// ============================================================================

/**
 * Generate simple random arrangement for non-CSP layouts
 */
const generateSimpleArrangement = (students, shape) => {
  const shuffled = [...students].sort(() => Math.random() - 0.5);

  switch (shape.layout) {
    case 'clusters': {
      const clusters = [];
      const studentsPerCluster = shape.studentsPerCluster || 4;
      const numClusters = shape.clusters || 4;

      for (let i = 0; i < numClusters; i++) {
        const clusterStudents = shuffled.slice(i * studentsPerCluster, (i + 1) * studentsPerCluster);
        clusters.push({
          id: `cluster-${i}`,
          students: clusterStudents,
          reasoning: 'קבוצה מגוונת עם תלמידים בעלי כישורים משלימים'
        });
      }
      return clusters;
    }

    case 'uShape':
    case 'circle': {
      const positions = [];
      const numPositions = Math.min(shape.positions || 16, shuffled.length);

      for (let i = 0; i < numPositions; i++) {
        positions.push({
          id: `position-${i}`,
          student: shuffled[i],
          position: i,
          reasoning: 'מיקום אופטימלי לדיון ושיתוף'
        });
      }
      return positions;
    }

    case 'flexible': {
      const stations = [];
      const numStations = shape.stations || 4;
      const studentsPerStation = Math.ceil(shuffled.length / numStations);

      for (let i = 0; i < numStations; i++) {
        const stationStudents = shuffled.slice(i * studentsPerStation, (i + 1) * studentsPerStation);
        stations.push({
          id: `station-${i}`,
          students: stationStudents,
          type: ['reading', 'writing', 'collaboration', 'individual'][i % 4],
          reasoning: 'תחנת למידה מותאמת לסגנון הלמידה'
        });
      }
      return stations;
    }

    default:
      return [];
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClassroomSeatingAI = ({ students = [], darkMode = false, theme = {} }) => {
  const [selectedShape, setSelectedShape] = useState('rows');
  const [arrangement, setArrangement] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [swapFeedback, setSwapFeedback] = useState(null);
  const [cspMetadata, setCspMetadata] = useState(null); // CSP solver metadata
  const [hoveredDesk, setHoveredDesk] = useState(null); // Desk hover state for tooltip
  const [selectedStudent, setSelectedStudent] = useState(null); // Selected student for side panel

  // Filter analyzed students only
  const analyzedStudents = students.filter(s => !s.needsAnalysis);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  // Generate AI recommendation on mount and when students change
  useEffect(() => {
    if (analyzedStudents.length > 0) {
      const recommendation = analyzeClassForSeating(analyzedStudents);
      setAiRecommendation(recommendation);
      setSelectedShape(recommendation.recommendedShape);
    }
  }, [students.length]);

  // Generate arrangement when shape changes
  useEffect(() => {
    if (analyzedStudents.length > 0) {
      const shape = SEATING_SHAPES[selectedShape];

      // Only use CSP solver for rows layout (which has rows/cols)
      if (shape.rows && shape.cols) {
        const result = solveSeatingCSP(analyzedStudents, shape, {
          populationSize: 50,
          generations: 100,
          mutationRate: 0.2
        });

        setArrangement(result.arrangement);
        setCspMetadata(result.metadata);

        console.log('🎯 CSP Solution:', {
          score: result.score,
          violations: result.violations,
          metadata: result.metadata
        });
      } else {
        // For other layouts, use simple random arrangement
        const simpleArrangement = generateSimpleArrangement(analyzedStudents, shape);
        setArrangement(simpleArrangement);
        setCspMetadata(null); // No CSP metadata for non-optimized layouts
      }
    }
  }, [selectedShape, students.length]);

  // Get location-based reasoning for a student placement
  const getLocationReasoning = (row, col, student, totalRows, totalCols) => {
    const isFirstRow = row === 0;
    const isLastRow = row === totalRows - 1;
    const isFirstCol = col === 0;
    const isLastCol = col === totalCols - 1;

    const challenges = student.challengesCount || 0;
    const strengths = student.strengthsCount || 0;

    const reasons = [];

    // Front row placement
    if (isFirstRow) {
      if (challenges >= 3) {
        reasons.push('🎯 שורה קדמית - דורש תשומת לב וניטור מוגבר מהמורה');
      } else {
        reasons.push('⭐ שורה קדמית - מיקום מרכזי לתלמיד מעורב');
      }
    }

    // Back row placement
    if (isLastRow) {
      if (strengths >= 3 && challenges <= 1) {
        reasons.push('✨ שורה אחורית - לומד עצמאי שיכול לעבוד באופן עצמאי');
      } else if (challenges >= 3) {
        reasons.push('⚠️ שורה אחורית - דורש מעקב תכוף למניעת הסחות דעת');
      }
    }

    // Side placements
    if (isFirstCol) {
      reasons.push('🚪 ליד הדלת - קל לתנועה ויציאה במידת הצורך');
    }

    if (isLastCol) {
      reasons.push('🪟 ליד החלון - אור טבעי ונוף מרגיע');
    }

    // Middle placement
    if (!isFirstRow && !isLastRow && !isFirstCol && !isLastCol) {
      reasons.push('🎓 מיקום מרכזי - איזון אופטימלי בין מעורבות ועצמאות');
    }

    return reasons.length > 0 ? reasons : ['📍 מיקום סטנדרטי בכיתה'];
  };

  const handleShapeChange = (shapeId) => {
    setIsGenerating(true);
    setTimeout(() => {
      setSelectedShape(shapeId);
      setIsGenerating(false);

      // Scroll to the seating arrangement visualization
      setTimeout(() => {
        const arrangementSection = document.getElementById('seating-arrangement-visualization');
        if (arrangementSection) {
          arrangementSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 300);
  };

  const handleRegenerateArrangement = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const shape = SEATING_SHAPES[selectedShape];

      // Only use CSP solver for rows layout
      if (shape.rows && shape.cols) {
        const result = solveSeatingCSP(analyzedStudents, shape, {
          populationSize: 50,
          generations: 100,
          mutationRate: 0.2
        });

        setArrangement(result.arrangement);
        setCspMetadata(result.metadata);

        console.log('🔄 Regenerated CSP Solution:', {
          score: result.score,
          violations: result.violations
        });
      } else {
        // For other layouts, regenerate simple arrangement
        const simpleArrangement = generateSimpleArrangement(analyzedStudents, shape);
        setArrangement(simpleArrangement);
        setCspMetadata(null);
      }

      setIsGenerating(false);
    }, 500);
  };

  /**
   * Evaluate a student swap using AI
   */
  const evaluateSwap = (student1, student2, pos1, pos2) => {
    const challenges1 = student1.challengesCount || 0;
    const challenges2 = student2.challengesCount || 0;
    const strengths1 = student1.strengthsCount || 0;
    const strengths2 = student2.strengthsCount || 0;

    let score = 50; // Neutral score
    let feedback = [];
    let type = 'neutral'; // 'good', 'warning', 'bad'
    let suggestions = [];

    // Evaluate based on student needs and positioning
    const isFrontRow1 = pos1.row < 2;
    const isFrontRow2 = pos2.row < 2;
    const isBackRow1 = pos1.row >= pos1.totalRows - 2;
    const isBackRow2 = pos2.row >= pos2.totalRows - 2;

    // High-challenge students should be in front
    if (challenges1 > 4) {
      if (isFrontRow2) {
        score += 20;
        feedback.push(`✅ מעולה! ${student1.name || student1.studentCode} זקוק לתמיכה קרובה - מיקום קדמי מושלם`);
      } else if (isBackRow2) {
        score -= 30;
        type = 'warning';
        feedback.push(`⚠️ אזהרה: ${student1.name || student1.studentCode} זקוק לניטור קרוב - מיקום אחורי לא מומלץ`);
        suggestions.push(`מומלץ למקם את ${student1.name || student1.studentCode} בשורות הקדמיות`);
      }
    }

    if (challenges2 > 4) {
      if (isFrontRow1) {
        score += 20;
        feedback.push(`✅ מעולה! ${student2.name || student2.studentCode} זקוק לתמיכה קרובה - מיקום קדמי מושלם`);
      } else if (isBackRow1) {
        score -= 30;
        type = 'warning';
        feedback.push(`⚠️ אזהרה: ${student2.name || student2.studentCode} זקוק לניטור קרוב - מיקום אחורי לא מומלץ`);
        suggestions.push(`מומלץ למקם את ${student2.name || student2.studentCode} בשורות הקדמיות`);
      }
    }

    // High performers can be in back
    if (strengths1 > 4 && challenges1 <= 2) {
      if (isBackRow2) {
        score += 15;
        feedback.push(`✅ טוב! ${student1.name || student1.studentCode} עצמאי ויכול לשבת בשורה אחורית`);
      } else if (isFrontRow2) {
        score -= 5;
        feedback.push(`💡 ${student1.name || student1.studentCode} חזק ועצמאי - יכול לשבת גם בשורות אחוריות`);
      }
    }

    if (strengths2 > 4 && challenges2 <= 2) {
      if (isBackRow1) {
        score += 15;
        feedback.push(`✅ טוב! ${student2.name || student2.studentCode} עצמאי ויכול לשבת בשורה אחורית`);
      } else if (isFrontRow1) {
        score -= 5;
        feedback.push(`💡 ${student2.name || student2.studentCode} חזק ועצמאי - יכול לשבת גם בשורות אחוריות`);
      }
    }

    // Peer mentoring opportunity
    const strongWeak1 = strengths1 > 4 && challenges2 > 4;
    const strongWeak2 = strengths2 > 4 && challenges1 > 4;

    if (strongWeak1 || strongWeak2) {
      score += 25;
      type = 'good';
      const mentor = strongWeak1 ? student1.name || student1.studentCode : student2.name || student2.studentCode;
      const mentee = strongWeak1 ? student2.name || student2.studentCode : student1.name || student1.studentCode;
      feedback.push(`🌟 מצוין! הזדמנות לחונכות עמיתים: ${mentor} יכול לתמוך ב-${mentee}`);
    }

    // Two high-challenge students together (warning)
    if (challenges1 > 3 && challenges2 > 3) {
      score -= 20;
      type = 'warning';
      feedback.push(`⚠️ שני תלמידים עם אתגרים גבוהים ליד אחד - ייתכן צורך בפיזור`);
      suggestions.push('שקול למקם תלמיד חזק אחד באמצע');
    }

    // Two high performers together (good for challenges)
    if (strengths1 > 4 && strengths2 > 4 && challenges1 <= 2 && challenges2 <= 2) {
      score += 10;
      feedback.push(`✅ שני תלמידים מצטיינים - יכולים לאתגר אחד את השני`);
    }

    // Determine final type based on score
    if (score >= 70) {
      type = 'good';
    } else if (score >= 40) {
      type = 'neutral';
    } else {
      type = 'warning';
    }

    // Add default feedback if none
    if (feedback.length === 0) {
      feedback.push('החלפה נייטרלית - לא נמצאו בעיות משמעותיות');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      type,
      feedback,
      suggestions,
      student1: student1.name || student1.studentCode,
      student2: student2.name || student2.studentCode
    };
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the students being swapped
      const student1 = analyzedStudents.find(s => s.studentCode === active.id);
      const student2 = analyzedStudents.find(s => s.studentCode === over.id);

      if (student1 && student2) {
        // Find their positions in the arrangement
        let pos1, pos2;
        arrangement.forEach((item, index) => {
          if (item.student.studentCode === active.id) {
            pos1 = { row: item.row || 0, col: item.col || 0, totalRows: arrangement.length };
          }
          if (item.student.studentCode === over.id) {
            pos2 = { row: item.row || 0, col: item.col || 0, totalRows: arrangement.length };
          }
        });

        // Evaluate the swap
        const evaluation = evaluateSwap(student1, student2, pos1 || { row: 0, col: 0, totalRows: 4 }, pos2 || { row: 0, col: 0, totalRows: 4 });

        // Show feedback
        setSwapFeedback(evaluation);

        // Auto-hide feedback after 8 seconds
        setTimeout(() => setSwapFeedback(null), 8000);

        // Perform the swap in arrangement
        const newArrangement = [...arrangement];
        const index1 = newArrangement.findIndex(item => item.student.studentCode === active.id);
        const index2 = newArrangement.findIndex(item => item.student.studentCode === over.id);

        if (index1 !== -1 && index2 !== -1) {
          const temp = newArrangement[index1].student;
          newArrangement[index1] = { ...newArrangement[index1], student: newArrangement[index2].student };
          newArrangement[index2] = { ...newArrangement[index2], student: temp };
          setArrangement(newArrangement);
        }

        console.log('Swap evaluated:', evaluation);
      }
    }
  };

  // Render empty state
  if (analyzedStudents.length === 0) {
    return (
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-8 border border-white/20 shadow-2xl`}>
        <div className="text-center py-12">
          <AlertCircle className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={64} />
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            אין תלמידים מנותחים
          </h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            יש לנתח תלמידים תחילה כדי לקבל המלצות ישיבה חכמות
          </p>
        </div>
      </div>
    );
  }

  const currentShape = SEATING_SHAPES[selectedShape];

  return (
    <div className="space-y-3">
      {/* Combined Header with AI Recommendation */}
      {aiRecommendation && showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-xl ${
            darkMode ? 'bg-white/5' : 'bg-white/40'
          } rounded-xl p-3 border ${darkMode ? 'border-white/10' : 'border-white/30'} shadow-xl`}
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center`}>
                <Grid3x3 className="text-white" size={16} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  סידור ישיבה חכם מבוסס AI
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {analyzedStudents.length} תלמידים מנותחים
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowExplanations(!showExplanations)}
                className={`px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 text-sm ${
                  showExplanations
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : darkMode ? 'bg-white/10 text-gray-300' : 'bg-white/30 text-gray-700'
                }`}
              >
                {showExplanations ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>הסברים</span>
              </button>

              <button
                onClick={handleRegenerateArrangement}
                disabled={isGenerating}
                className={`px-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all flex items-center gap-1 text-sm ${
                  isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>צור מחדש</span>
              </button>
            </div>
          </div>

          {/* AI Recommendation Content */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={16} />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      המלצת AI - {SEATING_SHAPES[aiRecommendation.recommendedShape].name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {aiRecommendation.reasoning}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${aiRecommendation.score}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      />
                    </div>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {aiRecommendation.score}%
                    </span>
                  </div>
                </div>

                {aiRecommendation.alternatives.length > 0 && (
                  <div className={`flex items-center gap-2 flex-wrap p-2 rounded-lg ${
                    darkMode ? 'bg-white/5' : 'bg-gradient-to-r from-blue-50 to-indigo-50'
                  } border ${darkMode ? 'border-white/10' : 'border-blue-100'}`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      חלופות:
                    </span>
                    {aiRecommendation.alternatives.filter(alt => SEATING_SHAPES[alt.shape]).map((alt, index) => (
                      <button
                        key={index}
                        onClick={() => handleShapeChange(alt.shape)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium shadow-sm ${
                          darkMode
                            ? 'bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white'
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700'
                        } transition-all hover:shadow-md hover:scale-105`}
                      >
                        {SEATING_SHAPES[alt.shape].name} ({alt.score}%)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      {/* CSP Placement Analysis Panel */}
      {/* CSP Metadata - Compact Summary */}
      {cspMetadata && selectedShape === 'rows' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-xl ${
            darkMode ? 'bg-white/5' : 'bg-white/40'
          } rounded-xl p-3 border ${darkMode ? 'border-white/10' : 'border-white/30'} shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center`}>
                <Brain className="text-white" size={16} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  אלגוריתם גנטי למיקום אופטימלי
                </h3>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  💡 העבר עכבר מעל שולחן לראות ניתוח תואמות מפורט
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ציון כולל</div>
                <div className={`text-2xl font-bold ${
                  cspMetadata.finalScore > 75 ? 'text-green-500' :
                  cspMetadata.finalScore > 50 ? 'text-yellow-500' : 'text-orange-500'
                }`}>
                  {cspMetadata.finalScore ? cspMetadata.finalScore.toFixed(1) : 0}%
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>דורות</div>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cspMetadata.generations || 0}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Shape Selector */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-3 border border-white/20 shadow-2xl`}>
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          בחר צורת ישיבה
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.values(SEATING_SHAPES).map((shape) => {
            const Icon = shape.icon;
            const isSelected = selectedShape === shape.id;
            const isRecommended = aiRecommendation?.recommendedShape === shape.id;

            return (
              <motion.button
                key={shape.id}
                onClick={() => handleShapeChange(shape.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                      : 'bg-white/50 hover:bg-white/70 text-gray-700'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="text-white" size={12} />
                  </div>
                )}

                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xl">{shape.emoji}</span>
                  <Icon size={18} />
                  <span className="text-sm font-medium text-center leading-tight">{shape.name}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Shape Description */}
        {currentShape && (
          <motion.div
            key={selectedShape}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}
          >
            <h4 className={`font-bold mb-1.5 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentShape.name}
            </h4>
            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentShape.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentShape.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className={`px-2 py-0.5 rounded-md text-sm ${
                    darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                  }`}
                >
                  ✓ {benefit}
                </span>
              ))}
            </div>

            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>מומלץ עבור:</strong> {currentShape.bestFor}
            </p>
          </motion.div>
        )}
      </div>

      {/* Color Legend */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-3 border border-white/20 shadow-2xl`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            מקרא צבעים
          </h3>
          <Info className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`} size={18} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {/* Red: At-risk */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/50 border-2 border-red-300 relative">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200">
                🔴
              </div>
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>סיכון גבוה</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>4+ אתגרים</p>
            </div>
          </div>

          {/* Yellow: Moderate support */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50 border-2 border-yellow-300 relative">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200">
                🟡
              </div>
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>דורש תמיכה</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>2-4 אתגרים</p>
            </div>
          </div>

          {/* Green: High performer */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50 border-2 border-green-300 relative">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200">
                🟢
              </div>
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>מצטיין</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>4+ חוזקות</p>
            </div>
          </div>

          {/* Blue: Balanced */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 border-2 border-blue-300 relative">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200">
                🔵
              </div>
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>מאוזן</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ביניים</p>
            </div>
          </div>

          {/* Gray: Not analyzed */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-500/50 border-2 border-gray-300 relative">
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-sm border border-gray-200">
                ⚪
              </div>
            </div>
            <div>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>לא נותח</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>אין נתונים</p>
            </div>
          </div>
        </div>

        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
          העבר עכבר מעל תלמיד לראות פרטים מלאים • הצבעים מבוססים על ניתוח ISHEBOT AI
        </p>
      </div>

      {/* Seating Arrangement Visualization */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div id="seating-arrangement-visualization" className={`backdrop-blur-xl ${
          darkMode ? 'bg-white/10' : 'bg-white/40'
        } rounded-3xl p-8 border border-white/20 shadow-2xl min-h-[600px]`}>
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className={`mx-auto mb-4 animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={48} />
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  יוצר סידור ישיבה...
                </p>
              </div>
            </div>
          ) : (
            <SortableContext items={analyzedStudents.map(s => s.studentCode)} strategy={rectSortingStrategy}>
              {/* Render based on shape type */}
              {currentShape.layout === 'grid' && (
                <div className="space-y-6">
                  {/* Board at the top */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-block px-8 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white font-bold shadow-lg`}>
                      <div className="text-3xl mb-1">📋</div>
                      <div>לוח</div>
                    </div>
                  </div>

                  {/* Teacher's Desk */}
                  <div className="flex justify-center mb-6">
                    <div className={`px-8 py-4 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-400/40' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'} border-2 shadow-xl`}>
                      <div className="flex items-center gap-3">
                        <Armchair className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`} size={28} />
                        <div>
                          <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>שולחן המורה</div>
                          <div className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>מיקום מרכזי לניהול הכיתה</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classroom with Door on Left and Windows on Right */}
                  <div className="flex gap-4">
                    {/* Door on the Left Side */}
                    <div className="w-20">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                        <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                        <span className={`text-sm font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                        <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                      </div>
                    </div>

                    {/* Student Desks Grid in the middle */}
                    <div className="flex-1">
                      <div className={`grid gap-4`} style={{
                        gridTemplateColumns: `repeat(${currentShape.cols}, 1fr)`
                      }}>
                        {arrangement.map((item, index) => {
                          const hasCompatibility = item.compatibility && item.leftStudent && item.rightStudent;
                          const compatScore = hasCompatibility ? item.compatibility.score : null;
                          const compatColor = compatScore > 75 ? 'green' : compatScore > 60 ? 'yellow' : compatScore > 40 ? 'orange' : 'red';

                          return (
                            <div
                              key={item.id}
                              className={`relative p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} border ${darkMode ? 'border-white/10' : 'border-gray-200'} flex items-center justify-center gap-3 min-h-[120px] hover:shadow-lg transition-all ${
                                hoveredDesk === item.id ? 'ring-2 ring-blue-500 scale-105' : ''
                              }`}
                            >
                              {/* Info button - only show if desk has students */}
                              {(item.leftStudent || item.rightStudent) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHoveredDesk(hoveredDesk === item.id ? null : item.id);
                                  }}
                                  className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                                    darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'
                                  }`}
                                  title="הצג ניתוח מלא"
                                >
                                  i
                                </button>
                              )}

                              {/* Left Student - pointer-events-none to not interfere with desk hover */}
                              <div className="pointer-events-auto">
                                {item.leftStudent ? (
                                  <DraggableStudent
                                    student={item.leftStudent}
                                    onInfo={setSelectedStudent}
                                    isDraggable={true}
                                    row={item.row}
                                    col={item.desk}
                                    totalRows={currentShape.rows}
                                    darkMode={darkMode}
                                  />
                                ) : (
                                  <div className={`w-16 h-16 rounded-full border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-400'} flex items-center justify-center pointer-events-none`}>
                                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>ריק</span>
                                  </div>
                                )}
                              </div>

                              {/* Right Student - pointer-events-none to not interfere with desk hover */}
                              <div className="pointer-events-auto">
                                {item.rightStudent ? (
                                  <DraggableStudent
                                    student={item.rightStudent}
                                    onInfo={setSelectedStudent}
                                    isDraggable={true}
                                    row={item.row}
                                    col={item.desk}
                                    totalRows={currentShape.rows}
                                    darkMode={darkMode}
                                  />
                                ) : (
                                  <div className={`w-16 h-16 rounded-full border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-400'} flex items-center justify-center pointer-events-none`}>
                                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>ריק</span>
                                  </div>
                                )}
                              </div>

                              {/* Enhanced Tooltip with Full Analysis */}
                              {hoveredDesk === item.id && (item.leftStudent || item.rightStudent) && ReactDOM.createPortal(
                                <>
                                  {/* Semi-transparent backdrop */}
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                    style={{ zIndex: 999999 }}
                                    onClick={() => setHoveredDesk(null)}
                                  />

                                  {/* Popup content */}
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                                    animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                                    exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                                    transition={{ duration: 0.2 }}
                                    className={`fixed p-5 rounded-xl shadow-2xl border-2 w-[420px] overflow-y-auto ${
                                      compatColor === 'green' ? 'bg-green-900 border-green-500' :
                                      compatColor === 'yellow' ? 'bg-yellow-900 border-yellow-500' :
                                      compatColor === 'orange' ? 'bg-orange-900 border-orange-500' :
                                      'bg-blue-900 border-blue-500'
                                    }`}
                                    style={{
                                      left: '50%',
                                      top: '50%',
                                      zIndex: 9999999,
                                      maxHeight: '90vh',
                                      maxWidth: '90vw'
                                    }}
                                  >
                                  {/* Header */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-white/30">
                                    <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                      <Brain size={20} />
                                      ניתוח מיקום AI
                                    </h4>
                                    <div className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded">
                                      שורה {item.row + 1}, שולחן {item.desk + 1}
                                    </div>
                                  </div>

                                  {/* Location Reasoning */}
                                  <div className="mb-4 bg-white/10 rounded-lg p-3">
                                    <h5 className="text-sm font-bold text-white mb-2 flex items-center gap-1">
                                      <Target size={14} />
                                      סיבות למיקום זה:
                                    </h5>
                                    <div className="space-y-1">
                                      {getLocationReasoning(item.row, item.desk, item.leftStudent || item.rightStudent, currentShape.rows, currentShape.cols).map((reason, idx) => (
                                        <div key={idx} className="text-xs text-white/90">
                                          {reason}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Students Analysis */}
                                  <div className="space-y-3 mb-4">
                                    {/* Left Student */}
                                    {item.leftStudent && (
                                      <div className="bg-white/15 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-bold text-white text-sm">← {item.leftStudent.name}</div>
                                          <div className="text-xs text-white/70">
                                            ✓ {item.leftStudent.strengthsCount || 0} חוזקות | ⚠ {item.leftStudent.challengesCount || 0} אתגרים
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-2">
                                          {item.leftStudent.learningStyle && (
                                            <div className="text-xs text-white/80 bg-white/10 rounded px-2 py-1 inline-block">
                                              📚 {item.leftStudent.learningStyle}
                                            </div>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHoveredDesk(null);
                                              setSelectedStudent({ ...item.leftStudent, row: item.row, col: item.desk, totalRows: currentShape.rows });
                                            }}
                                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                                          >
                                            <User size={12} />
                                            פרופיל מלא
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Right Student */}
                                    {item.rightStudent && (
                                      <div className="bg-white/15 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="font-bold text-white text-sm">→ {item.rightStudent.name}</div>
                                          <div className="text-xs text-white/70">
                                            ✓ {item.rightStudent.strengthsCount || 0} חוזקות | ⚠ {item.rightStudent.challengesCount || 0} אתגרים
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-2">
                                          {item.rightStudent.learningStyle && (
                                            <div className="text-xs text-white/80 bg-white/10 rounded px-2 py-1 inline-block">
                                              📚 {item.rightStudent.learningStyle}
                                            </div>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHoveredDesk(null);
                                              setSelectedStudent({ ...item.rightStudent, row: item.row, col: item.desk, totalRows: currentShape.rows });
                                            }}
                                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap"
                                          >
                                            <User size={12} />
                                            פרופיל מלא
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Compatibility Analysis */}
                                  {hasCompatibility && (
                                    <div className="bg-white/15 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-bold text-white flex items-center gap-1">
                                          <Heart size={14} />
                                          תואמות הזוג
                                        </h5>
                                        <span className={`text-xl font-bold ${
                                          compatColor === 'green' ? 'text-green-300' :
                                          compatColor === 'yellow' ? 'text-yellow-300' :
                                          compatColor === 'orange' ? 'text-orange-300' :
                                          'text-red-300'
                                        }`}>
                                          {compatScore}%
                                        </span>
                                      </div>
                                      {item.compatibility.reasons && item.compatibility.reasons.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                          {item.compatibility.reasons.slice(0, 4).map((reason, idx) => (
                                            <div key={idx} className="text-xs text-white/90 bg-white/10 rounded px-2 py-1">
                                              • {reason}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Swap Suggestions - Show if compatibility is low */}
                                  {hasCompatibility && compatScore < 65 && (
                                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mt-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle size={16} className="text-yellow-400" />
                                        <h5 className="text-sm font-bold text-yellow-300">
                                          💡 הצעות לשיפור
                                        </h5>
                                      </div>
                                      <p className="text-xs text-white/80 mb-2">
                                        תאימות נמוכה ({compatScore}%) - שקול אפשרויות אלו:
                                      </p>
                                      <div className="space-y-1">
                                        <div className="text-xs text-white/90 bg-white/10 rounded px-2 py-1">
                                          • נסה לשבץ את {item.leftStudent?.name || 'תלמיד זה'} עם תלמיד בעל יכולות משלימות
                                        </div>
                                        <div className="text-xs text-white/90 bg-white/10 rounded px-2 py-1">
                                          • שקול להפריד אם יש התנגשויות אישיות
                                        </div>
                                        <div className="text-xs text-white/90 bg-white/10 rounded px-2 py-1">
                                          • לחץ "סדר מחדש" למטה לקבלת סידור אוטומטי חדש
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* High compatibility - positive reinforcement */}
                                  {hasCompatibility && compatScore >= 75 && (
                                    <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 mt-4">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-400" />
                                        <p className="text-sm font-bold text-green-300">
                                          🌟 זוג מצוין! תאימות גבוהה ({compatScore}%)
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                </motion.div>
                                </>,
                                document.body
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4 Windows on the Right Side */}
                    <div className="flex flex-col gap-4 w-24">
                      {[1, 2, 3, 4].map((windowNum) => (
                        <div
                          key={windowNum}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                        >
                          <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                          <span className={`text-sm font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentShape.layout === 'clusters' && (
                <div className="space-y-6">
                  {/* Board at the top */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-block px-8 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white font-bold shadow-lg`}>
                      <div className="text-3xl mb-1">📋</div>
                      <div>לוח</div>
                    </div>
                  </div>

                  {/* Classroom with Door on Left and Windows on Right */}
                  <div className="flex gap-4">
                    {/* Door on the Left Side */}
                    <div className="w-20">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                        <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                        <span className={`text-sm font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                        <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                      </div>
                    </div>

                    {/* Clusters Grid in the middle */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-6">
                        {arrangement.map((cluster, index) => (
                          <div
                            key={cluster.id}
                            className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-br from-blue-100/50 to-purple-100/50'} border ${darkMode ? 'border-blue-500/30' : 'border-blue-300'}`}
                          >
                            <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              קבוצה {index + 1}
                            </h4>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              {(cluster.students && cluster.students.length > 0) ? (
                                cluster.students.map(student => (
                                  <div key={student.studentCode} className="flex justify-center">
                                    <DraggableStudent student={student} onInfo={setSelectedStudent} isDraggable={true} darkMode={darkMode} />
                                  </div>
                                ))
                              ) : (
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center col-span-2`}>
                                  אין תלמידים בקבוצה זו
                                </p>
                              )}
                            </div>

                            {showExplanations && cluster.reasoning && (
                              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {cluster.reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4 Windows on the Right Side */}
                    <div className="flex flex-col gap-4 w-24">
                      {[1, 2, 3, 4].map((windowNum) => (
                        <div
                          key={windowNum}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                        >
                          <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                          <span className={`text-sm font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(currentShape.layout === 'uShape' || currentShape.layout === 'circle') && (
                <div className="space-y-6">
                  {/* Board at the top - shown for both uShape and circle */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-block px-8 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white font-bold shadow-lg`}>
                      <div className="text-3xl mb-1">📋</div>
                      <div>לוח</div>
                    </div>
                  </div>

                  {currentShape.layout === 'uShape' && (
                    <>
                      {/* Teacher's Desk for U-Shape */}
                      <div className="flex justify-center mb-6">
                        <div className={`px-6 py-3 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-400/40' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'} border-2 shadow-xl`}>
                          <div className="flex items-center gap-2">
                            <Armchair className={`${darkMode ? 'text-purple-300' : 'text-purple-600'}`} size={24} />
                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>שולחן המורה</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Classroom with Door on Left and Windows on Right for U-Shape/Circle */}
                  <div className="flex gap-4">
                    {/* Door on the Left Side */}
                    <div className="w-20">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                        <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                        <span className={`text-sm font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                        <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                      </div>
                    </div>

                    {/* U-Shape/Circle seating in the middle */}
                    <div className="relative mx-auto" style={{
                      width: '600px',
                      height: '600px'
                    }}>
                      {arrangement.map((item, index) => {
                        const angle = (index / arrangement.length) * 2 * Math.PI - Math.PI / 2;
                        const radius = currentShape.layout === 'circle' ? 250 : 230;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        // For U-shape, only place on bottom and sides (not top)
                        if (currentShape.layout === 'uShape' && y < -100) return null;

                        return (
                          <div
                            key={item.id}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                            }}
                          >
                            <DraggableStudent student={item.student} onInfo={setSelectedStudent} isDraggable={true} darkMode={darkMode} />

                            {showExplanations && item.reasoning && (
                              <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.reasoning}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Center indicator */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className={`w-32 h-32 rounded-full border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-400'} flex items-center justify-center`}>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>מרכז</span>
                        </div>
                      </div>
                    </div>

                    {/* 4 Windows on the Right Side */}
                    <div className="flex flex-col gap-4 w-24">
                      {[1, 2, 3, 4].map((windowNum) => (
                        <div
                          key={windowNum}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                        >
                          <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                          <span className={`text-sm font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentShape.layout === 'flexible' && (
                <div className="space-y-6">
                  {/* Board at the top */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-block px-8 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white font-bold shadow-lg`}>
                      <div className="text-3xl mb-1">📋</div>
                      <div>לוח</div>
                    </div>
                  </div>

                  {/* Classroom with Door on Left and Windows on Right */}
                  <div className="flex gap-4">
                    {/* Door on the Left Side */}
                    <div className="w-20">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                        <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                        <span className={`text-sm font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                        <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                      </div>
                    </div>

                    {/* Flexible Stations Grid in the middle */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-6">
                        {arrangement.map((station, index) => (
                          <div
                            key={station.id}
                            className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-green-900/30 to-teal-900/30' : 'bg-gradient-to-br from-green-100/50 to-teal-100/50'} border ${darkMode ? 'border-green-500/30' : 'border-green-300'}`}
                          >
                            <h4 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              תחנה {index + 1}
                            </h4>

                            <div className="flex flex-wrap gap-3 justify-center mb-3">
                              {(station.students && station.students.length > 0) ? (
                                station.students.map(student => (
                                  <DraggableStudent key={student.studentCode} student={student} onInfo={setSelectedStudent} isDraggable={true} darkMode={darkMode} />
                                ))
                              ) : (
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center w-full`}>
                                  אין תלמידים בתחנה זו
                                </p>
                              )}
                            </div>

                            {showExplanations && station.reasoning && (
                              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {station.reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4 Windows on the Right Side */}
                    <div className="flex flex-col gap-4 w-24">
                      {[1, 2, 3, 4].map((windowNum) => (
                        <div
                          key={windowNum}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                        >
                          <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                          <span className={`text-sm font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SortableContext>
          )}
        </div>
      </DndContext>

      {/* Swap Feedback Notification */}
      <AnimatePresence>
        {swapFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[90] max-w-2xl w-full px-4"
          >
            <div className={`${
              swapFeedback.type === 'good'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : swapFeedback.type === 'warning'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
            } rounded-2xl shadow-2xl p-6 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                    {swapFeedback.type === 'good' ? '✅' : swapFeedback.type === 'warning' ? '⚠️' : '💡'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">הערכת החלפה</h3>
                    <p className="text-sm text-white/80">
                      {swapFeedback.student1} ↔️ {swapFeedback.student2}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSwapFeedback(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Score Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">ציון התאמה</span>
                  <span className="text-lg font-bold">{swapFeedback.score}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${swapFeedback.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>

              {/* Feedback Messages */}
              <div className="space-y-2 mb-4">
                {swapFeedback.feedback.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 rounded-lg p-3 text-sm text-right"
                  >
                    {msg}
                  </motion.div>
                ))}
              </div>

              {/* Suggestions */}
              {swapFeedback.suggestions.length > 0 && (
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm font-semibold mb-2">💡 הצעות לשיפור:</p>
                  <div className="space-y-1">
                    {swapFeedback.suggestions.map((suggestion, index) => (
                      <p key={index} className="text-sm text-white/90 text-right">
                        • {suggestion}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => window.print()}
          className={`px-6 py-3 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/50 hover:bg-white/70 text-gray-900'} transition-all flex items-center gap-2`}
        >
          <Download size={20} />
          <span>הורד PDF</span>
        </button>

        <button
          className={`px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all flex items-center gap-2`}
        >
          <Save size={20} />
          <span>שמור סידור</span>
        </button>
      </div>

      {/* Student Info Side Panel */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentInfoPanel
            studentData={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            darkMode={darkMode}
            selectedShape={selectedShape}
            cspMetadata={cspMetadata}
            arrangement={arrangement}
            onOpenDeskPopup={(deskId) => setHoveredDesk(deskId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassroomSeatingAI;







