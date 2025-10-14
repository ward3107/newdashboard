import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Grid3x3,
  Heart,
  Brain,
  BarChart3,
  Target,
  Settings,
  ChevronRight,
  ChevronDown,
  Eye,
  Activity,
  AlertTriangle,
  Zap,
  BookOpen,
  RefreshCw,
  MessageSquare,
  UserPlus,
  Map,
  Compass,
  Shield,
  TrendingUp,
  Bell,
  Layers,
  PieChart,
  User,
  Star
} from 'lucide-react';

/**
 * UnifiedSidebar - Main navigation sidebar for the unified dashboard
 * Replaces both the old dashboard nav and the separate analytics page
 */
const UnifiedSidebar = ({
  selectedView,
  selectedSubView,
  onNavigate,
  darkMode,
  theme,
  pendingCount = 0
}) => {
  const [expandedMenus, setExpandedMenus] = useState({ overview: true });

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMainItemClick = (item) => {
    // If item has sub-items, toggle expansion and navigate to first sub-item
    if (item.subItems && item.subItems.length > 0) {
      toggleMenu(item.id);
      onNavigate(item.id, item.subItems[0].id);
    } else {
      // No sub-items, just navigate
      onNavigate(item.id);
    }
  };

  const handleSubItemClick = (mainId, subId) => {
    onNavigate(mainId, subId);
  };

  // Navigation menu structure
  const menuItems = [
    {
      id: 'overview',
      name: 'סקירה כללית',
      icon: Home,
      color: 'from-blue-600 to-indigo-600',
      priority: true,
      subItems: []
    },
    {
      id: 'students',
      name: 'תלמידים',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      subItems: [
        { id: 'all', name: 'כל התלמידים', icon: Users },
        { id: 'analyzed', name: 'מנותחים', icon: Eye },
        { id: 'pending', name: 'ממתינים לניתוח', icon: AlertTriangle }
      ]
    },
    {
      id: 'seating',
      name: 'סידור ישיבה',
      icon: Grid3x3,
      color: 'from-purple-600 to-pink-600',
      priority: true,
      subItems: [
        { id: 'map', name: 'מפת כיתה', icon: Grid3x3 },
        { id: 'recommendations', name: 'המלצות', icon: Star },
        { id: 'edit', name: 'ערוך סידור', icon: RefreshCw }
      ]
    },
    {
      id: 'emotional',
      name: 'ניתוח רגשי-התנהגותי',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      subItems: [
        { id: 'overview', name: 'סקירה כללית', icon: Eye },
        { id: 'emotional', name: 'ניתוח רגשי', icon: Heart },
        { id: 'behavioral', name: 'ניתוח התנהגותי', icon: Activity },
        { id: 'risk', name: 'מדדי סיכון', icon: AlertTriangle }
      ]
    },
    {
      id: 'cognitive',
      name: 'ניתוח קוגניטיבי',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      subItems: [
        { id: 'processing', name: 'עיבוד מידע', icon: Zap },
        { id: 'memory', name: 'זיכרון וקשב', icon: BookOpen },
        { id: 'styles', name: 'סגנונות למידה', icon: Layers },
        { id: 'strengths', name: 'נקודות חוזק', icon: Star }
      ]
    },
    {
      id: 'metrics',
      name: 'מדדים וסטטיסטיקות',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      subItems: [
        { id: 'trends', name: 'מגמות', icon: TrendingUp },
        { id: 'comparisons', name: 'השוואות', icon: PieChart },
        { id: 'reports', name: 'דוחות', icon: BookOpen }
      ]
    },
    {
      id: 'intervention',
      name: 'התערבות ותמיכה',
      icon: Target,
      color: 'from-teal-500 to-cyan-500',
      subItems: [
        { id: 'recommendations', name: 'המלצות להתערבות', icon: Zap },
        { id: 'resources', name: 'משאבים', icon: BookOpen },
        { id: 'strategies', name: 'אסטרטגיות', icon: Target },
        { id: 'tracking', name: 'מעקב', icon: Eye }
      ]
    },
    {
      id: 'settings',
      name: 'הגדרות',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      subItems: [
        { id: 'analyze', name: 'AI חכם', icon: Zap, badge: pendingCount > 0 ? pendingCount : null },
        { id: 'manage', name: 'ניהול תלמידים', icon: Users },
        { id: 'admin', name: 'Admin', icon: Shield },
        { id: 'theme', name: 'נושא', icon: RefreshCw }
      ]
    }
  ];

  return (
    <div className={`w-72 h-screen sticky top-0 ${
      darkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-xl border-l ${
      darkMode ? 'border-gray-800' : 'border-gray-200'
    } flex flex-col overflow-hidden`}>

      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center`}>
            <BarChart3 className="text-white" size={20} />
          </div>
          <div>
            <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              לוח בקרה
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ניהול ומעקב
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = selectedView === item.id;
          const isExpanded = expandedMenus[item.id];
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id}>
              {/* Main Item Button */}
              <button
                onClick={() => handleMainItemClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : darkMode
                      ? 'text-gray-300 hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <div className="flex-1 text-right">
                  <span className="font-medium block">{item.name}</span>
                  {item.priority && (
                    <span className={`text-xs ${isActive ? 'text-white/80' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      מומלץ
                    </span>
                  )}
                </div>
                {hasSubItems && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={16} className={isActive ? 'text-white' : ''} />
                  </motion.div>
                )}
              </button>

              {/* Sub-items */}
              {hasSubItems && (
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pr-8 pt-1 space-y-0.5">
                        {item.subItems.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive = selectedView === item.id && selectedSubView === subItem.id;

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubItemClick(item.id, subItem.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                                isSubActive
                                  ? darkMode
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                  : darkMode
                                    ? 'text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                              }`}
                            >
                              <SubIcon size={14} />
                              <span className="flex-1 text-right">{subItem.name}</span>
                              {subItem.badge && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                              {isSubActive && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-1.5 h-1.5 bg-current rounded-full"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex-shrink-0`}>
        <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ISHEBOT Platform v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSidebar;
