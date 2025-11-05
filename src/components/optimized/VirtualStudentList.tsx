/**
 * Virtual Scrolling Student List Component
 * Optimized for rendering large lists efficiently
 */

import React, { memo, useCallback, CSSProperties } from 'react';
import { List, RowComponentProps } from 'react-window';
import { motion } from 'framer-motion';
import { User, BookOpen, Brain, Calendar } from 'lucide-react';
import { Student } from '../../types';

interface VirtualStudentListProps {
  students: Student[];
  height?: number;
  itemHeight?: number;
  onStudentClick?: (student: Student) => void;
  searchQuery?: string;
  className?: string;
}

/**
 * Individual student row component
 * Memoized for performance
 */
const StudentRow = memo<RowComponentProps<{
  students: Student[];
  onStudentClick?: (student: Student) => void;
  searchQuery?: string;
}>>(({ index, style, ariaAttributes, students, onStudentClick, searchQuery }): React.ReactElement => {
  const student = students[index];

  // Highlight search terms
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Determine color based on strengths/challenges ratio
  const getRatioColor = () => {
    const ratio = student.challengesCount > 0
      ? student.strengthsCount / student.challengesCount
      : student.strengthsCount;

    if (ratio >= 2) return 'border-green-500 bg-green-50';
    if (ratio >= 1) return 'border-blue-500 bg-blue-50';
    return 'border-orange-500 bg-orange-50';
  };

  return (
    <div style={style} className="px-4" {...ariaAttributes}>
      <div
        onClick={() => onStudentClick?.(student)}
        className={`
          relative overflow-hidden rounded-lg border-2 p-4 mb-2
          cursor-pointer transition-all duration-200 hover:shadow-lg
          ${getRatioColor()}
        `}
      >
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-2 right-2">
            <Brain className="w-32 h-32" />
          </div>
        </div>

        <div className="relative z-10 flex items-start justify-between">
          {/* Student Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                {highlightText(student.name || `תלמיד ${student.studentCode}`)}
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                {student.studentCode}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">כיתה {student.classId}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{student.quarter}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-green-600 font-medium">
                  {student.strengthsCount} חוזקות
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-orange-600 font-medium">
                  {student.challengesCount} אתגרים
                </span>
              </div>
            </div>

            {student.learningStyle && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">סגנון למידה:</span>{' '}
                {highlightText(student.learningStyle)}
              </div>
            )}

            {student.keyNotes && (
              <div className="mt-1 text-sm text-gray-500 truncate">
                {highlightText(student.keyNotes)}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col items-center ml-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={
                    student.strengthsCount > student.challengesCount
                      ? '#10b981'
                      : '#f59e0b'
                  }
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${
                    (student.strengthsCount /
                      (student.strengthsCount + student.challengesCount)) *
                    176
                  } 176`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">
                  {Math.round(
                    (student.strengthsCount /
                      (student.strengthsCount + student.challengesCount)) *
                    100
                  )}%
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-1">חוזקות</span>
          </div>
        </div>
      </div>
    </div>
  );
});

StudentRow.displayName = 'StudentRow';

/**
 * Main Virtual Student List Component
 */
export const VirtualStudentList: React.FC<VirtualStudentListProps> = ({
  students,
  height = 600,
  itemHeight = 140,
  onStudentClick,
  searchQuery,
  className = '',
}) => {
  // Note: In react-window v2, row props are passed directly to the component
  // No need for itemData wrapper

  // Custom scrollbar styles
  const outerElementType = React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div
      ref={ref}
      {...props}
      className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200"
      style={{
        ...props.style,
        overflowY: 'auto',
      }}
    />
  ));

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <User className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg">לא נמצאו תלמידים</p>
        <p className="text-sm mt-2">נסה לשנות את הפילטרים או החיפוש</p>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white rounded-lg shadow-sm`}>
      <List
        defaultHeight={height}
        rowCount={students.length}
        rowHeight={itemHeight}
        rowComponent={StudentRow as any}
        rowProps={{
          students,
          onStudentClick,
          searchQuery
        }}
        overscanCount={3} // Render 3 items outside of visible area for smoother scrolling
        style={{ width: '100%' }}
      />
    </div>
  );
};

/**
 * Alternative: Variable size list for different item heights
 */
export const VirtualStudentListVariable = memo(() => {
  // Implementation for variable height items if needed
  return null;
});

// Export with performance optimization wrapper
export default memo(VirtualStudentList);