import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  filterOptions,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onClearFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.classId && filters.classId !== 'all') count++;
    if (filters.quarter && filters.quarter !== 'all') count++;
    if (filters.learningStyle && filters.learningStyle !== 'all') count++;
    if (filters.minStrengths) count++;
    if (filters.maxChallenges) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      classId: 'all',
      quarter: 'all',
      learningStyle: 'all',
      minStrengths: '',
      maxChallenges: ''
    });
    setSearchQuery('');
    if (onClearFilters) onClearFilters();
  };

  const sortOptions = [
    { value: 'name', label: 'שם התלמיד' },
    { value: 'date', label: 'תאריך עדכון' },
    { value: 'classId', label: 'כיתה' },
    { value: 'strengthsCount', label: 'מספר חוזקות' },
    { value: 'challengesCount', label: 'מספר אתגרים' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <label htmlFor="student-search" className="sr-only">חיפוש תלמידים</label>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="student-search"
          name="student-search"
          type="text"
          placeholder="חפש לפי שם תלמיד, קוד תלמיד, כיתה או מילות מפתח..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            text-right placeholder-gray-400 transition-all duration-200
            hover:border-gray-400
          "
        />
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 left-0 pl-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
          </motion.button>
        )}
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Filter Toggle */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-medium
            transition-all duration-200 border
            ${showFilters
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>מסננים</span>
          {activeFiltersCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              {activeFiltersCount}
            </motion.span>
          )}
          <motion.div
            animate={{ rotate: showFilters ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Sort Controls */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">מיין לפי:</label>
          <select
            id="sort-by"
            name="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <motion.button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={sortOrder === 'asc' ? 'סדר עולה' : 'סדר יורד'}
          >
            <motion.div
              animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Clear Filters */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleClearFilters}
              className="flex items-center space-x-1 space-x-reverse px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>נקה הכל</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Class Filter */}
              <div>
                <label htmlFor="filter-class" className="block text-sm font-medium text-gray-700 mb-2">
                  כיתה
                </label>
                <select
                  id="filter-class"
                  name="filter-class"
                  value={filters.classId}
                  onChange={(e) => handleFilterChange('classId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">כל הכיתות</option>
                  {filterOptions?.classes?.map(classId => (
                    <option key={classId} value={classId}>{classId}</option>
                  ))}
                </select>
              </div>

              {/* Quarter Filter */}
              <div>
                <label htmlFor="filter-quarter" className="block text-sm font-medium text-gray-700 mb-2">
                  רבעון
                </label>
                <select
                  id="filter-quarter"
                  name="filter-quarter"
                  value={filters.quarter}
                  onChange={(e) => handleFilterChange('quarter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">כל הרבעונים</option>
                  {filterOptions?.quarters?.map(quarter => (
                    <option key={quarter} value={quarter}>{quarter}</option>
                  ))}
                </select>
              </div>

              {/* Learning Style Filter */}
              <div>
                <label htmlFor="filter-learning-style" className="block text-sm font-medium text-gray-700 mb-2">
                  סגנון למידה
                </label>
                <select
                  id="filter-learning-style"
                  name="filter-learning-style"
                  value={filters.learningStyle}
                  onChange={(e) => handleFilterChange('learningStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">כל הסגנונות</option>
                  {filterOptions?.learningStyles?.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Min Strengths Filter */}
              <div>
                <label htmlFor="filter-min-strengths" className="block text-sm font-medium text-gray-700 mb-2">
                  חוזקות מינימליות
                </label>
                <input
                  id="filter-min-strengths"
                  name="filter-min-strengths"
                  type="number"
                  min="0"
                  max="10"
                  value={filters.minStrengths}
                  onChange={(e) => handleFilterChange('minStrengths', e.target.value)}
                  placeholder="מספר מינימלי"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Challenges Filter */}
              <div>
                <label htmlFor="filter-max-challenges" className="block text-sm font-medium text-gray-700 mb-2">
                  אתגרים מקסימליים
                </label>
                <input
                  id="filter-max-challenges"
                  name="filter-max-challenges"
                  type="number"
                  min="0"
                  max="10"
                  value={filters.maxChallenges}
                  onChange={(e) => handleFilterChange('maxChallenges', e.target.value)}
                  placeholder="מספר מקסימלי"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Summary */}
            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">{activeFiltersCount}</span>
                      <span className="mr-1">מסננים פעילים</span>
                    </div>
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      נקה מסננים
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAndFilters;