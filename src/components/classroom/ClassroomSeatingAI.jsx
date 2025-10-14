import React, { useState, useEffect } from 'react';
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
  Wind
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    emoji: '📚'
  },
  uShape: {
    id: 'uShape',
    name: 'צורת פרסה (U)',
    icon: Circle,
    description: 'סידור בצורת U - מעודד דיונים והשתתפות',
    benefits: ['תקשורת חזותית', 'דיונים קבוצתיים', 'נגישות למורה'],
    bestFor: 'דיונים, פעילויות קבוצתיות, סמינרים',
    layout: 'uShape',
    positions: 16,
    emoji: '💬'
  },
  clusters: {
    id: 'clusters',
    name: 'אשכולות (קבוצות)',
    icon: Users,
    description: 'שולחנות מקובצים - מעודד עבודה צוותית',
    benefits: ['שיתוף פעולה', 'למידה עמיתים', 'עבודת צוות'],
    bestFor: 'פרויקטים, עבודה צוותית, למידה שיתופית',
    layout: 'clusters',
    clusters: 4,
    studentsPerCluster: 4,
    emoji: '👥'
  },
  pairs: {
    id: 'pairs',
    name: 'זוגות',
    icon: Square,
    description: 'סידור בזוגות - מתאים ללמידה משותפת',
    benefits: ['למידה זוגית', 'תמיכה הדדית', 'אינטראקציה קרובה'],
    bestFor: 'למידה בזוגות, תרגול, חונכות עמיתים',
    layout: 'pairs',
    pairs: 8,
    emoji: '👫'
  },
  circle: {
    id: 'circle',
    name: 'מעגל',
    icon: Circle,
    description: 'סידור במעגל - מעודד שוויון והשתתפות',
    benefits: ['שוויון', 'דיון פתוח', 'קשר עין'],
    bestFor: 'דיונים סוקרטיים, שיתוף רגשי, בניית קהילה',
    layout: 'circle',
    positions: 16,
    emoji: '⭕'
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
    emoji: '🎯'
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
    alternatives.push({ shape: 'pairs', score: 75, reason: 'מאפשר למידה זוגית עם תמיכה הדדית' });
    alternatives.push({ shape: 'uShape', score: 70, reason: 'נגישות למורה לכל התלמידים' });
  } else if (independentPercent > 50) {
    recommendedShape = 'rows';
    score = 88;
    reasoning = `${Math.round(independentPercent)}% מהתלמידים מעדיפים למידה עצמאית. סידור מסורתי יתמוך בסגנון הלמידה שלהם.`;
    alternatives.push({ shape: 'flexible', score: 80, reason: 'תחנות למידה עצמאית מגוונות' });
    alternatives.push({ shape: 'pairs', score: 70, reason: 'איזון בין עצמאות לתמיכה' });
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
    alternatives.push({ shape: 'pairs', score: 75, reason: 'למידה זוגית עם תמיכה' });
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
  const availableStudents = [...students];

  // Shuffle for random starting point
  for (let i = availableStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableStudents[i], availableStudents[j]] = [availableStudents[j], availableStudents[i]];
  }

  // Generate arrangement based on shape
  switch (shape.layout) {
    case 'grid': // Rows
      for (let row = 0; row < shape.rows; row++) {
        for (let col = 0; col < shape.cols; col++) {
          if (availableStudents.length > 0) {
            const student = availableStudents.shift();
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
      const studentsPerCluster = Math.ceil(students.length / shape.clusters);
      for (let cluster = 0; cluster < shape.clusters; cluster++) {
        const clusterStudents = [];
        for (let i = 0; i < studentsPerCluster && availableStudents.length > 0; i++) {
          const student = availableStudents.shift();
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

    case 'pairs':
      let pairIndex = 0;
      while (availableStudents.length >= 2) {
        const student1 = availableStudents.shift();
        const student2 = availableStudents.shift();
        arrangement.push({
          id: `pair-${pairIndex}`,
          type: 'pair',
          students: [student1, student2],
          reasoning: getPairReasoning(student1, student2)
        });
        pairIndex++;
      }
      // Handle odd student
      if (availableStudents.length === 1) {
        arrangement.push({
          id: `pair-${pairIndex}`,
          type: 'single',
          students: [availableStudents[0]],
          reasoning: 'תלמיד יחיד - יכול לעבוד עצמאית או להצטרף לצמד קיים'
        });
      }
      break;

    case 'uShape':
    case 'circle':
      // Arrange in circular/U pattern
      students.forEach((student, index) => {
        arrangement.push({
          id: `pos-${index}`,
          position: index,
          student,
          reasoning: getCircularReasoning(student, index, students.length)
        });
      });
      break;

    case 'flexible':
      // Divide into flexible stations
      const stationSize = Math.ceil(students.length / shape.stations);
      for (let station = 0; station < shape.stations; station++) {
        const stationStudents = [];
        for (let i = 0; i < stationSize && availableStudents.length > 0; i++) {
          stationStudents.push(availableStudents.shift());
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
  const learningStyle = student.learningStyle || '';

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
      mainReason = 'מיקום קדמי לתמיכה מיידית';
      details.push('📌 קרבה למורה לניטור והדרכה מתמשכת');
      details.push('👁️ קשר עין ישיר עם המורה');
      details.push('🎯 הפחתת הסחות דעת מאחור');
      basedOn.push(`${challenges} אתגרים התנהגותיים`);
      basedOn.push('צורך בתמיכה מיידית');
    } else if (strengths > 4) {
      mainReason = 'מיקום מוביל - דוגמה חיובית לכיתה';
      details.push('⭐ תלמיד מצטיין המשמש מודל לחיקוי');
      details.push('💡 יכול להשפיע חיובית על האווירה');
      details.push('🎓 תשובות מהירות ומעודדות');
      basedOn.push(`${strengths} חוזקות מזוהות`);
      basedOn.push('ביצועים גבוהים');
    } else {
      mainReason = 'מיקום קדמי לעידוד השתתפות';
      details.push('✋ קירוב למורה לעידוד השתתפות');
      details.push('📚 גישה טובה ללוח והצגות');
      basedOn.push('צורך בעידוד להשתתפות');
    }
  }

  // Back row placement
  else if (isBackRow) {
    if (strengths > 4) {
      mainReason = 'מיקום אחורי - עצמאות וביטחון';
      details.push('🎯 תלמיד עצמאי שלא זקוק לפיקוח צמוד');
      details.push('📖 מסוגל להתרכז ללא עזרה מתמדת');
      details.push('💪 מיקום זה מאפשר לו לנהל את הלמידה בעצמו');
      basedOn.push(`${strengths} חוזקות`);
      basedOn.push('עצמאות גבוהה');
    } else if (learningStyle.includes('עצמאי')) {
      mainReason = 'מיקום אחורי - מתאים ללמידה עצמאית';
      details.push('🤫 סביבה שקטה יותר');
      details.push('📝 אפשרות לעבוד בקצב אישי');
      basedOn.push('סגנון למידה עצמאי');
    } else {
      mainReason = 'מיקום אחורי - דורש מודעות עצמית';
      details.push('⚠️ יש לעקוב ולוודא השתתפות פעילה');
      details.push('👀 מומלץ בדיקות תכופות של המורה');
      basedOn.push('ביצועים בינוניים');
    }
  }

  // Middle row placement
  else {
    if (strengths >= 3 && challenges >= 3) {
      mainReason = 'מיקום מאוזן - איזון בין תמיכה לעצמאות';
      details.push('⚖️ מרחק אופטימלי מהמורה');
      details.push('👥 קרבה לחברים לשיתוף פעולה');
      details.push('🎵 לא קרוב מדי ולא רחוק מדי');
      basedOn.push(`${strengths} חוזקות, ${challenges} אתגרים`);
      basedOn.push('פרופיל מאוזן');
    } else if (learningStyle.includes('חברתי')) {
      mainReason = 'מיקום מרכזי - עידוד אינטראקציה חברתית';
      details.push('👫 מיקום טוב לעבודה בקבוצות');
      details.push('💬 קרבה לתלמידים רבים');
      details.push('🤝 עידוד שיתוף פעולה');
      basedOn.push('סגנון למידה חברתי');
    } else {
      mainReason = 'מיקום מרכזי - נגיש לכולם';
      details.push('📍 מיקום מרכזי בכיתה');
      details.push('👀 רואה את הלוח בבירור');
      details.push('🎯 גישה טובה למורה ולחברים');
      basedOn.push('מיקום סטנדרטי');
    }
  }

  // Additional considerations for window seat
  if (isNearWindow) {
    if (learningStyle.includes('ויזואלי') || learningStyle.includes('חזותי')) {
      details.push('🪟 קרוב לחלון - אור טבעי מועיל ללומד חזותי');
      basedOn.push('למידה חזותית');
    } else if (challenges > 3) {
      details.push('⚠️ קרוב לחלון - יש להקפיד על ריכוז (הסחות אפשריות)');
    }
  }

  // Additional considerations for door seat
  if (isNearDoor) {
    details.push('🚪 קרוב לדלת - יציאה מהירה במידת הצורך');
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
// DRAGGABLE STUDENT COMPONENT
// ============================================================================

const DraggableStudent = ({ student, onInfo, isDraggable = true, row = 0, col = 0, totalRows = 4 }) => {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      whileHover={{ scale: 1.05 }}
      className="relative group cursor-move"
    >
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow-lg border-2 border-white">
        <div className="text-center leading-tight">
          {student.studentCode.toString()}
        </div>
        {isDraggable && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <GripVertical className="text-gray-600" size={10} />
          </div>
        )}
      </div>

      {/* Enhanced AI-powered tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded-xl shadow-2xl overflow-hidden max-w-sm" style={{ width: '320px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 border-b border-white/20">
            <div className="font-bold text-sm">{student.name || `תלמיד ${student.studentCode}`}</div>
            <div className="text-[10px] text-blue-200 mt-1">קוד: {student.studentCode}</div>
          </div>

          {/* Main Reason */}
          <div className="px-4 py-3 bg-gray-800/50 border-b border-white/10">
            <div className="flex items-start gap-2">
              <Sparkles className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />
              <div>
                <div className="text-[10px] text-gray-400 mb-1">סיבה למיקום:</div>
                <div className="font-semibold text-xs leading-relaxed">{placementReason.mainReason}</div>
              </div>
            </div>
          </div>

          {/* Detailed Reasons */}
          {placementReason.details.length > 0 && (
            <div className="px-4 py-3 bg-gray-800/30 border-b border-white/10">
              <div className="text-[10px] text-gray-400 mb-2">פרטים מלאים:</div>
              <div className="space-y-1.5">
                {placementReason.details.map((detail, index) => (
                  <div key={index} className="text-[11px] leading-relaxed text-gray-200 text-right">
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Based On */}
          {placementReason.basedOn.length > 0 && (
            <div className="px-4 py-3 bg-gray-900/50">
              <div className="text-[10px] text-gray-400 mb-2">מבוסס על:</div>
              <div className="flex flex-wrap gap-1.5">
                {placementReason.basedOn.map((factor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-[10px] border border-blue-500/30"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </motion.div>
  );
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
      const newArrangement = generateOptimalSeating(analyzedStudents, selectedShape);
      setArrangement(newArrangement);
    }
  }, [selectedShape, students.length]);

  const handleShapeChange = (shapeId) => {
    setIsGenerating(true);
    setTimeout(() => {
      setSelectedShape(shapeId);
      setIsGenerating(false);
    }, 300);
  };

  const handleRegenerateArrangement = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newArrangement = generateOptimalSeating(analyzedStudents, selectedShape);
      setArrangement(newArrangement);
      setIsGenerating(false);
    }, 500);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Handle drag and drop logic here
      // For now, we'll keep the arrangement as is
      console.log('Dragged:', active.id, 'to:', over.id);
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
    <div className="space-y-6">
      {/* Header */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center`}>
              <Grid3x3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                סידור ישיבה חכם מבוסס AI
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {analyzedStudents.length} תלמידים מנותחים
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className={`px-4 py-2 rounded-xl transition-all ${
                showExplanations
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : darkMode ? 'bg-white/10 text-gray-300' : 'bg-white/30 text-gray-700'
              }`}
            >
              {showExplanations ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="mr-2 text-sm">הסברים</span>
            </button>

            <button
              onClick={handleRegenerateArrangement}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
              <span className="mr-2 text-sm">צור מחדש</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendation Card */}
      {aiRecommendation && showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-xl ${
            darkMode ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40' : 'bg-gradient-to-r from-purple-100/80 to-pink-100/80'
          } rounded-3xl p-6 border border-purple-300/30 shadow-2xl`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-white" size={24} />
            </div>

            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                המלצת AI - {SEATING_SHAPES[aiRecommendation.recommendedShape].name}
              </h3>

              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {aiRecommendation.reasoning}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ציון התאמה:
                </span>
                <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden max-w-xs">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiRecommendation.score}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  />
                </div>
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {aiRecommendation.score}%
                </span>
              </div>

              {aiRecommendation.alternatives.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    חלופות מומלצות:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendation.alternatives.map((alt, index) => (
                      <button
                        key={index}
                        onClick={() => handleShapeChange(alt.shape)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          darkMode ? 'bg-white/10 hover:bg-white/20 text-gray-300' : 'bg-white/50 hover:bg-white/70 text-gray-700'
                        } transition-all`}
                      >
                        {SEATING_SHAPES[alt.shape].name} ({alt.score}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Shape Selector */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          בחר צורת ישיבה
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                className={`relative p-4 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : darkMode
                      ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                      : 'bg-white/50 hover:bg-white/70 text-gray-700'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="text-white" size={14} />
                  </div>
                )}

                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{shape.emoji}</span>
                  <Icon size={20} />
                  <span className="text-xs font-medium text-center">{shape.name}</span>
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
            className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}
          >
            <h4 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentShape.name}
            </h4>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentShape.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {currentShape.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-lg text-xs ${
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

      {/* Seating Arrangement Visualization */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={`backdrop-blur-xl ${
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
                          <div className={`text-xs ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>מיקום מרכזי לניהול הכיתה</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classroom with Windows on Left and Door on Right */}
                  <div className="flex gap-4">
                    {/* 4 Windows on the Left Side */}
                    <div className="flex flex-col gap-4 w-24">
                      {[1, 2, 3, 4].map((windowNum) => (
                        <div
                          key={windowNum}
                          className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                        >
                          <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                          <span className={`text-[10px] font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                        </div>
                      ))}
                    </div>

                    {/* Student Desks Grid in the middle */}
                    <div className="flex-1">
                      <div className={`grid gap-4`} style={{
                        gridTemplateColumns: `repeat(${currentShape.cols}, 1fr)`
                      }}>
                        {arrangement.map((item, index) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} border ${darkMode ? 'border-white/10' : 'border-gray-200'} flex flex-col items-center justify-center min-h-[120px] hover:shadow-lg transition-shadow`}
                          >
                            <DraggableStudent
                              student={item.student}
                              isDraggable={true}
                              row={item.row}
                              col={item.col}
                              totalRows={currentShape.rows}
                            />

                            {showExplanations && item.reasoning && (
                              <p className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.reasoning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Door on the Right Side beside first row of students */}
                    <div className="w-20">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                        <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                        <span className={`text-xs font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                        <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentShape.layout === 'clusters' && (
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
                              <DraggableStudent student={student} isDraggable={true} />
                            </div>
                          ))
                        ) : (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center col-span-2`}>
                            אין תלמידים בקבוצה זו
                          </p>
                        )}
                      </div>

                      {showExplanations && cluster.reasoning && (
                        <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {cluster.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentShape.layout === 'pairs' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {arrangement.map((pair, index) => (
                    <div
                      key={pair.id}
                      className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-center gap-3 mb-2">
                        {(pair.students && pair.students.length > 0) ? (
                          pair.students.map(student => (
                            <DraggableStudent key={student.studentCode} student={student} isDraggable={true} />
                          ))
                        ) : (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                            אין תלמידים בזוג זה
                          </p>
                        )}
                      </div>

                      {showExplanations && pair.reasoning && (
                        <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {pair.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(currentShape.layout === 'uShape' || currentShape.layout === 'circle') && (
                <div className="space-y-6">
                  {currentShape.layout === 'uShape' && (
                    <>
                      {/* Board at the top */}
                      <div className="flex justify-center mb-6">
                        <div className={`inline-block px-8 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} text-white font-bold shadow-lg`}>
                          <div className="text-3xl mb-1">📋</div>
                          <div>לוח</div>
                        </div>
                      </div>

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

                  {/* Classroom with Windows on Left and Door on Right for U-Shape/Circle */}
                  <div className="flex gap-4">
                    {/* 4 Windows on the Left Side */}
                    {currentShape.layout === 'uShape' && (
                      <div className="flex flex-col gap-4 w-24">
                        {[1, 2, 3, 4].map((windowNum) => (
                          <div
                            key={windowNum}
                            className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20 border-blue-400/30' : 'bg-blue-100/60 border-blue-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}
                          >
                            <Wind className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
                            <span className={`text-[10px] font-medium mt-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>חלון {windowNum}</span>
                          </div>
                        ))}
                      </div>
                    )}

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
                            <DraggableStudent student={item.student} isDraggable={true} />

                            {showExplanations && item.reasoning && (
                              <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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

                    {/* Door on the Right Side for U-Shape */}
                    {currentShape.layout === 'uShape' && (
                      <div className="w-20">
                        <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20 border-green-400/30' : 'bg-green-100/60 border-green-300'} border-2 border-dashed flex flex-col items-center justify-center h-32`}>
                          <DoorOpen className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={28} />
                          <span className={`text-xs font-medium mt-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>דלת</span>
                          <span className={`text-[9px] ${darkMode ? 'text-green-300' : 'text-green-600'} text-center mt-1`}>כניסה/יציאה</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentShape.layout === 'flexible' && (
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
                            <DraggableStudent key={student.studentCode} student={student} isDraggable={true} />
                          ))
                        ) : (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center w-full`}>
                            אין תלמידים בתחנה זו
                          </p>
                        )}
                      </div>

                      {showExplanations && station.reasoning && (
                        <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {station.reasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SortableContext>
          )}
        </div>
      </DndContext>

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
    </div>
  );
};

export default ClassroomSeatingAI;
