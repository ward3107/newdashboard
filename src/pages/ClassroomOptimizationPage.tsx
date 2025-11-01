/**
 * Classroom Seating Optimization Page
 * Allows teachers to optimize classroom seating arrangements using genetic algorithms
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  optimizeClassroom,
  testOptimizationConnection,
  type OptimizeClassroomRequest,
  type SeatingArrangement,
  type OptimizationStudent,
  type LayoutType,
} from '../services/optimizationAPI';

const ClassroomOptimizationPage: React.FC = () => {
  const { t } = useTranslation();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<SeatingArrangement | null>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('rows');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  // Sample students for demo
  const getSampleStudents = (): OptimizationStudent[] => [
    {
      id: 'S001',
      name: 'David Cohen',
      gender: 'male',
      age: 12,
      academic_level: 'proficient',
      academic_score: 85.0,
      behavior_level: 'good',
      behavior_score: 90.0,
      attention_span: 7,
      is_leader: true,
      is_shy: false,
      friends_ids: ['S002'],
      incompatible_ids: [],
      special_needs: [],
      requires_front_row: false,
      requires_quiet_area: false,
      has_mobility_issues: false,
      primary_language: 'Hebrew',
      is_bilingual: false,
    },
    {
      id: 'S002',
      name: 'Sarah Smith',
      gender: 'female',
      age: 12,
      academic_level: 'advanced',
      academic_score: 95.0,
      behavior_level: 'excellent',
      behavior_score: 95.0,
      attention_span: 9,
      is_leader: false,
      is_shy: false,
      friends_ids: ['S001'],
      incompatible_ids: [],
      special_needs: [],
      requires_front_row: false,
      requires_quiet_area: false,
      has_mobility_issues: false,
      primary_language: 'English',
      is_bilingual: false,
    },
    {
      id: 'S003',
      name: 'Michael Brown',
      gender: 'male',
      age: 11,
      academic_level: 'basic',
      academic_score: 65.0,
      behavior_level: 'average',
      behavior_score: 70.0,
      attention_span: 5,
      is_leader: false,
      is_shy: false,
      friends_ids: [],
      incompatible_ids: ['S004'],
      special_needs: [],
      requires_front_row: true,
      requires_quiet_area: false,
      has_mobility_issues: false,
      primary_language: 'English',
      is_bilingual: false,
    },
    {
      id: 'S004',
      name: 'Emma Johnson',
      gender: 'female',
      age: 12,
      academic_level: 'proficient',
      academic_score: 80.0,
      behavior_level: 'challenging',
      behavior_score: 60.0,
      attention_span: 4,
      is_leader: false,
      is_shy: false,
      friends_ids: [],
      incompatible_ids: ['S003'],
      special_needs: [],
      requires_front_row: false,
      requires_quiet_area: true,
      has_mobility_issues: false,
      primary_language: 'English',
      is_bilingual: false,
    },
    {
      id: 'S005',
      name: 'Olivia Davis',
      gender: 'female',
      age: 12,
      academic_level: 'advanced',
      academic_score: 92.0,
      behavior_level: 'excellent',
      behavior_score: 88.0,
      attention_span: 8,
      is_leader: true,
      is_shy: false,
      friends_ids: [],
      incompatible_ids: [],
      special_needs: [],
      requires_front_row: false,
      requires_quiet_area: false,
      has_mobility_issues: false,
      primary_language: 'Spanish',
      is_bilingual: true,
    },
    {
      id: 'S006',
      name: 'James Wilson',
      gender: 'male',
      age: 11,
      academic_level: 'below_basic',
      academic_score: 55.0,
      behavior_level: 'average',
      behavior_score: 75.0,
      attention_span: 6,
      is_leader: false,
      is_shy: true,
      friends_ids: [],
      incompatible_ids: [],
      special_needs: [],
      requires_front_row: true,
      requires_quiet_area: false,
      has_mobility_issues: false,
      primary_language: 'English',
      is_bilingual: false,
    },
  ];

  const handleTestConnection = async () => {
    const loadingToast = toast.loading('Testing connection to optimization backend...');

    const response = await testOptimizationConnection();

    toast.dismiss(loadingToast);

    if (response.success && response.data) {
      toast.success(`Connected! Backend version: ${response.data.version}`);
    } else {
      toast.error(response.error || 'Failed to connect to optimization backend');
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const loadingToast = toast.loading('Optimizing classroom seating arrangement...');

    const request: OptimizeClassroomRequest = {
      students: getSampleStudents(),
      layout_type: layoutType,
      rows,
      cols,
      max_generations: 100,
    };

    try {
      const response = await optimizeClassroom(request);

      toast.dismiss(loadingToast);

      if (response.success && response.data?.result) {
        setResult(response.data.result);
        toast.success(
          `Optimization complete! Fitness: ${response.data.result.fitness_score.toFixed(3)}`
        );
      } else {
        toast.error(response.error || response.data?.error || 'Optimization failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to optimize classroom');
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getStudentName = (studentId: string): string => {
    const student = getSampleStudents().find((s) => s.id === studentId);
    return student?.name || studentId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧬 Classroom Seating Optimization
          </h1>
          <p className="text-gray-600">
            AI-powered seating arrangement using genetic algorithms
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Layout Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Type
              </label>
              <select
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as LayoutType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rows">Rows</option>
                <option value="pairs">Pairs</option>
                <option value="clusters">Clusters</option>
                <option value="u-shape">U-Shape</option>
                <option value="circle">Circle</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Rows */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleTestConnection}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              🔌 Test Connection
            </button>
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                isOptimizing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isOptimizing ? '⏳ Optimizing...' : '🚀 Optimize Seating'}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">Optimization Results</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Fitness Score</div>
                <div className="text-2xl font-bold text-green-700">
                  {(result.fitness_score * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Academic Balance</div>
                <div className="text-2xl font-bold text-blue-700">
                  {(result.objective_scores.academic_balance * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Behavioral</div>
                <div className="text-2xl font-bold text-purple-700">
                  {(result.objective_scores.behavioral_balance * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Computation Time</div>
                <div className="text-2xl font-bold text-orange-700">
                  {result.computation_time.toFixed(2)}s
                </div>
              </div>
            </div>

            {/* Seating Chart */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Seating Arrangement</h3>
              <div className="flex flex-col gap-2">
                {Array.from({ length: result.layout.rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2 justify-center">
                    {Array.from({ length: result.layout.cols }).map((_, colIndex) => {
                      const seat = result.layout.seats.find(
                        (s) => s.position.row === rowIndex && s.position.col === colIndex
                      );

                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: rowIndex * 0.1 + colIndex * 0.05 }}
                          className={`
                            w-32 h-24 rounded-lg border-2 flex items-center justify-center text-center p-2
                            ${seat?.is_empty ? 'bg-gray-200 border-gray-300' : 'bg-blue-100 border-blue-400'}
                            ${seat?.position.is_front_row ? 'ring-2 ring-yellow-400' : ''}
                          `}
                        >
                          {seat && !seat.is_empty && seat.student_id ? (
                            <div>
                              <div className="font-semibold text-sm">
                                {getStudentName(seat.student_id)}
                              </div>
                              <div className="text-xs text-gray-600">
                                {seat.position.is_front_row && '⭐ Front'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Empty</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                  <span>Occupied Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded"></div>
                  <span>Empty Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded ring-2 ring-yellow-400"></div>
                  <span>⭐ Front Row</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClassroomOptimizationPage;
