import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Shield,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

const OptimizedLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showPlayButton, setShowPlayButton] = React.useState(false);

  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: Brain },
    { id: 'features', label: 'תכונות', icon: Target },
    { id: 'benefits', label: 'יתרונות', icon: TrendingUp },
    { id: 'security', label: 'אבטחה', icon: Shield }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ISHEBOT - המערכת החכמה לניהול כיתה
                </h2>
                <p className="text-gray-600 mb-6">
                  טכנולוגיה מתקדמת שמשנה את הדרך שבה מורים מנהלים את הכיתה. אלגוריתם גנטי מתקדם לאופטימיזציה מדעית של סידור ישיבה.
                </p>
                <div className="space-y-3">
                  {[
                    'ניתוח 50+ נקודות נתונים לכל תלמיד',
                    '6 מבני כיתה שונים',
                    'שיפור אוטומטי בכל דור',
                    'ממשק ידידותי וקל לשימוש'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: 'תלמידים', value: '50+', color: 'from-blue-500 to-cyan-500' },
                    { icon: Target, label: 'תכונות', value: '6', color: 'from-purple-500 to-pink-500' },
                    { icon: Zap, label: 'מהירות', value: '98%', color: 'from-green-500 to-emerald-500' },
                    { icon: Shield, label: 'אבטחה', value: '9.5/10', color: 'from-red-500 to-orange-500' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-br ${stat.color} p-4 rounded-lg text-white text-center`}
                    >
                      <stat.icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'features':
        return (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">תכונות מתקדמות</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Brain,
                  title: 'אלגוריתם גנטי מתקדם (CSP)',
                  description: 'אופטימיזציה מדעית של סידור ישיבה',
                  features: ['חישוב תואמות', 'ציון איכות', 'שיפור אוטומטי'],
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Target,
                  title: '6 מבני כיתה',
                  description: 'גמישות מלאה לכל סוג שיעור',
                  features: ['שורות', 'אשכולות', 'U-Shape', 'מעגל', 'זוגות', 'מותאם אישית'],
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: BarChart3,
                  title: 'ניתוח מתקדם',
                  description: '50+ נקודות נתונים לכל תלמיד',
                  features: ['התנהגות', 'ביצועים', 'העדפות', 'תוצאות'],
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Clock,
                  title: 'חיסכון זמן',
                  description: 'אוטומציה מלאה של תהליכים',
                  features: ['סידור אוטומטי', 'דוחות מיידיים', 'עדכונים בזמן אמת'],
                  color: 'from-yellow-500 to-orange-500'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'benefits':
        return (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">היתרונות של ISHEBOT</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: 'שיפור ביצועים',
                  description: 'שיפור של עד 30% בהישגי תלמידים',
                  metric: '30%',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Clock,
                  title: 'חיסכון זמן',
                  description: 'חיסכון של 15 שעות עבודה שבועיות',
                  metric: '15 ש׳',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Users,
                  title: 'מעורבות תלמידים',
                  description: 'עלייה של 40% בהשתתפות כיתתית',
                  metric: '40%',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: BookOpen,
                  title: 'למידה אישית',
                  description: 'התאמה אוטומטית לצרכי כל תלמיד',
                  metric: '100%',
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: BarChart3,
                  title: 'דיווחים מתקדמים',
                  description: 'תובנות מעמיקות על דינמיקת כיתה',
                  metric: '50+',
                  color: 'from-red-500 to-pink-500'
                },
                {
                  icon: Zap,
                  title: 'יעילות',
                  description: 'הפחתת זמן הכנה לשיעורים',
                  metric: '80%',
                  color: 'from-indigo-500 to-purple-500'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${benefit.color} text-white mb-4`}>
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{benefit.metric}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">אבטחה ברמה עליונה</h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">9.5/10</div>
                    <div className="text-green-700">דירוג אבטחה</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-700">Enterprise-Grade</div>
                  <div className="text-xs text-green-600">ISO 27001 Compliant</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'הגנה מפני האקינג',
                  icon: Lock,
                  features: ['הצפנה AES-256', 'טוקני CSRF', 'הגבלת קצב', 'זיהוי בוטים']
                },
                {
                  title: 'פרטיות מידע',
                  icon: Shield,
                  features: ['גישה מאובטחת', 'מדיניות פרטיות', 'גיבוי אוטומטי', 'מחיקה מאובטחת']
                },
                {
                  title: 'ניטור בזמן אמת',
                  icon: BarChart3,
                  features: ['זיהוי איומים', 'דיווח סיכונים', 'ביקורת גישה', 'לוג מאובטח']
                },
                {
                  title: 'תאימות תקנים',
                  icon: CheckCircle,
                  features: ['GDPR', 'SOC 2', 'ISO 27001', 'HIPAA Ready']
                }
              ].map((security, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <security.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{security.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {security.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/security-dashboard')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                <span>לוח בקרת אבטחה</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                ISHEBOT
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPlayButton(!showPlayButton)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                התחל עכשיו
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 rtl:space-x-reverse overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="h-full p-8">
            <AnimatePresence mode="wait">
              <TabContent />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showPlayButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPlayButton(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">הכר את ISHEBOT</h3>
                  <button
                    onClick={() => setShowPlayButton(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">סרטון הדגמה יופיע כאן</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedLandingPage;