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
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">התפלגות לפי כיתות</h3>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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
                <p>אין נתונים להצגה</p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {classData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.classes[index % COLORS.classes.length] }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-gray-600">{item.value} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Styles Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">סגנונות למידה</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="h-64">
            {learningStyleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningStyleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    fill="#4285f4"
                    radius={[4, 4, 0, 0]}
                  >
                    {learningStyleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.learningStyles[index % COLORS.learningStyles.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>אין נתונים להצגה</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Strengths vs Challenges Comparison */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-2 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">חוזקות מול אתגרים</h3>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
          </div>

          <div className="h-64">
            {strengthsChallengesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthsChallengesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="strengths"
                    fill={COLORS.metrics.strengths}
                    name="חוזקות"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="challenges"
                    fill={COLORS.metrics.challenges}
                    name="אתגרים"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>אין נתונים להצגה</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Statistics */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">סיכום סטטיסטי</h3>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.averageStrengths}
              </div>
              <div className="text-sm text-blue-800 font-medium">ממוצע חוזקות</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {stats.averageChallenges || '0'}
              </div>
              <div className="text-sm text-red-800 font-medium">ממוצע אתגרים</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.max(...students.map(s => s.strengthsCount))}
              </div>
              <div className="text-sm text-green-800 font-medium">מקסימום חוזקות</div>
            </div>

            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {Math.min(...students.map(s => s.challengesCount))}
              </div>
              <div className="text-sm text-amber-800 font-medium">מינימום אתגרים</div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">תובנות מהירות</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• הכיתה הגדולה ביותר: {classData.length > 0 && classData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}</div>
              <div>• סגנון הלמידה הנפוץ: {learningStyleData.length > 0 && learningStyleData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name}</div>
              <div>• יחס חוזקות לאתגרים: {(stats.averageStrengths / (stats.averageChallenges || 1)).toFixed(2)}:1</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChartsSection;