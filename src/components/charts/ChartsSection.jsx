import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const ChartsSection = ({ students, stats }) => {
  // Process data for charts
  const classData = Object.entries(stats.byClass || {}).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / stats.totalStudents) * 100).toFixed(1)
  }));

  const learningStyleData = Object.entries(stats.byLearningStyle || {}).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / students.length) * 100).toFixed(1)
  }));

  // Strengths vs Challenges data
  const strengthsChallengesData = students.map(student => ({
    name: student.studentCode, // Student code
    strengths: student.strengthsCount,
    challenges: student.challengesCount,
    classId: student.classId
  })).slice(0, 10); // Show top 10 students

  // Colors for charts
  const COLORS = {
    classes: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#ff9800', '#795548', '#607d8b'],
    learningStyles: ['#2196f3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#00bcd4', '#3f51b5', '#8bc34a'],
    metrics: {
      strengths: '#34a853',
      challenges: '#ea4335'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.payload.percentage && ` (${entry.payload.percentage}%)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {value}
      </text>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Class Distribution Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏫</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">התפלגות לפי כיתות</h3>
          </div>

          <div className="h-64">
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.classes[index % COLORS.classes.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-base">אין נתונים להצגה</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {classData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS.classes[index % COLORS.classes.length] }}
                  ></div>
                  <span className="font-semibold text-gray-900">{item.name}</span>
                </div>
                <span className="text-gray-600 font-medium">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Styles Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">סגנונות למידה</h3>
          </div>

          <div className="h-64">
            {learningStyleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningStyleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#4285f4"
                    radius={[6, 6, 0, 0]}
                  >
                    {learningStyleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.learningStyles[index % COLORS.learningStyles.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-base">אין נתונים להצגה</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Strengths vs Challenges Comparison */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-200 lg:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">חוזקות מול אתגרים</h3>
          </div>

          <div className="h-64">
            {strengthsChallengesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthsChallengesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#374151' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="strengths"
                    fill={COLORS.metrics.strengths}
                    name="חוזקות"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="challenges"
                    fill={COLORS.metrics.challenges}
                    name="אתגרים"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-base">אין נתונים להצגה</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Statistics */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 border border-gray-200 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">סיכום סטטיסטי</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Average Strengths */}
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">💪</div>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {stats.averageStrengths}
              </div>
              <div className="text-sm text-gray-600 font-medium">ממוצע חוזקות</div>
            </div>

            {/* Average Challenges */}
            <div className="text-center p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-red-700 mb-1">
                {stats.averageChallenges || '0'}
              </div>
              <div className="text-sm text-gray-600 font-medium">ממוצע אתגרים</div>
            </div>

            {/* Maximum Strengths */}
            <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-3xl font-bold text-green-700 mb-1">
                {Math.max(...students.map(s => s.strengthsCount))}
              </div>
              <div className="text-sm text-gray-600 font-medium">מקסימום חוזקות</div>
            </div>

            {/* Minimum Challenges */}
            <div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-3xl font-bold text-orange-700 mb-1">
                {Math.min(...students.map(s => s.challengesCount))}
              </div>
              <div className="text-sm text-gray-600 font-medium">מינימום אתגרים</div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h4 className="text-lg font-bold text-gray-900">תובנות מהירות</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏫</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-600">הכיתה הגדולה ביותר</span>
                  <p className="font-semibold text-gray-900">{classData.length > 0 && classData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📚</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-600">סגנון הלמידה הנפוץ</span>
                  <p className="font-semibold text-gray-900">{learningStyleData.length > 0 && learningStyleData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚖️</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-600">יחס חוזקות לאתגרים</span>
                  <p className="font-semibold text-gray-900">{(stats.averageStrengths / (stats.averageChallenges || 1)).toFixed(2)}:1</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChartsSection;