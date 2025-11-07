import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClassroomSeating.css';

// Desk assignments data
const deskAssignments = [
  { num: 1, student1: 70101, student2: 70123, score: 6 },
  { num: 2, student1: 70102, student2: 70107, score: 8 },
  { num: 3, student1: 70103, student2: 70109, score: 6 },
  { num: 4, student1: 70104, student2: 70112, score: 6 },
  { num: 5, student1: 70105, student2: 70129, score: 5 },
  { num: 6, student1: 70108, student2: 70113, score: 8 },
  { num: 7, student1: 70110, student2: 70116, score: 5 },
  { num: 8, student1: 70111, student2: 70120, score: 6 },
  { num: 9, student1: 70115, student2: 70121, score: 5 },
  { num: 10, student1: 70117, student2: 70118, score: 8 },
  { num: 11, student1: 70122, student2: 70125, score: 5 },
  { num: 12, student1: 70124, student2: 70128, score: 8 },
  { num: 13, student1: 70126, student2: 70131, score: 8 },
  { num: 14, student1: 70127, student2: 70130, score: 6 },
  { num: 15, student1: 70132, student2: null, score: 0 }, // Single student
];

// Helper function to get compatibility class
const getCompatibilityClass = (score) => {
  if (score >= 8) return 'excellent';
  if (score >= 5) return 'good';
  if (score >= 3) return 'moderate';
  return 'needs-attention';
};

// Helper function to get compatibility background color
const getCompatibilityColor = (score) => {
  if (score >= 8) return 'linear-gradient(135deg, #d4f1d4, #a8e6a8)'; // Light green
  if (score >= 5) return 'linear-gradient(135deg, #ffe4b5, #ffd699)'; // Light orange
  if (score >= 3) return 'linear-gradient(135deg, #e6e6fa, #d1d1f0)'; // Light purple
  return 'linear-gradient(135deg, #ffb6c1, #ff99aa)'; // Light pink
};

// Individual student circle component
const StudentCircle = ({ studentId, isFirst, onStudentClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const bgGradient = isFirst
    ? 'linear-gradient(135deg, #a8d8ea, #6bb6d6)' // Light blue
    : 'linear-gradient(135deg, #ffcab0, #ff9a76)'; // Light orange

  const handleClick = () => {
    setShowTooltip(!showTooltip);
    onStudentClick(studentId);
  };

  return (
    <div className="relative">
      <motion.div
        className="student-circle"
        style={{ background: bgGradient }}
        onClick={handleClick}
        whileHover={{ scale: 1.25 }}
        transition={{ duration: 0.3 }}
      >
        {studentId}
      </motion.div>

      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30"
        >
          לחץ לפרטים
        </motion.div>
      )}
    </div>
  );
};

// Individual desk component
const Desk = ({ assignment, isEmpty, onStudentClick }) => {
  if (isEmpty) {
    return (
      <div className="desk empty">
        <p className="text-gray-400 text-center">ריק</p>
      </div>
    );
  }

  const { num, student1, student2, score } = assignment;
  const compatibilityClass = getCompatibilityClass(score);

  return (
    <motion.div
      className={`desk ${compatibilityClass}`}
      style={{
        background: getCompatibilityColor(score),
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        zIndex: 100,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Desk number badge */}
      <div className="desk-number">{num}</div>

      {/* Students container */}
      <div className="students-container">
        <StudentCircle
          studentId={student1}
          isFirst={true}
          onStudentClick={onStudentClick}
        />

        {student2 && (
          <>
            <span className="text-lg font-bold text-gray-600">+</span>
            <StudentCircle
              studentId={student2}
              isFirst={false}
              onStudentClick={onStudentClick}
            />
          </>
        )}
      </div>

      {/* Compatibility score */}
      <div className="compatibility-score">
        {student2 ? `התאמה: ${score}/10` : 'תלמיד יחיד'}
      </div>
    </motion.div>
  );
};

// Main ClassroomSeating component
const ClassroomSeating = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const containerRef = useRef(null);

  // Scroll to center when component mounts
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 100);
    }
  }, []);

  const handleStudentClick = (studentId) => {
    setSelectedStudent(studentId);
    // You can add navigation to student detail page here
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  // Create array of 16 positions (15 desks + 1 empty)
  const deskPositions = [...deskAssignments, ...Array(16 - deskAssignments.length).fill(null)];

  return (
    <div ref={containerRef} className="classroom-seating-container">
      {/* Header Card */}
      <div className="classroom-header">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪑</span>
          <h2 className="text-xl font-bold text-gray-800">
            מפת ישיבה בכיתה - 15 שולחנות
          </h2>
        </div>
      </div>

      {/* Classroom Visual */}
      <div className="classroom-room">
        {/* Blackboard */}
        <div className="blackboard">
          <span className="text-white font-semibold">לוח הכיתה - כיתה ז'1</span>
        </div>

        {/* Desk Grid */}
        <div className="desk-grid">
          {deskPositions.map((assignment, index) => (
            <Desk
              key={index}
              assignment={assignment}
              isEmpty={!assignment}
              onStudentClick={handleStudentClick}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="classroom-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#d4f1d4' }}></div>
          <span>התאמה מצוינת (8-10)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ffe4b5' }}></div>
          <span>התאמה טובה (5-7)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#e6e6fa' }}></div>
          <span>התאמה בינונית (3-4)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ffb6c1' }}></div>
          <span>דורש מעקב (0-2)</span>
        </div>
      </div>

      {/* Student Detail Modal (placeholder) */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">פרטי תלמיד</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-700">מספר תלמיד: {selectedStudent}</p>
              <p className="text-sm text-gray-500 mt-2">
                לחץ על כפתור זה כדי לראות פרטים נוספים
              </p>
              <button
                onClick={handleCloseModal}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                סגור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassroomSeating;
