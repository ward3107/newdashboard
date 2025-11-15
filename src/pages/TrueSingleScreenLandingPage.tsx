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
  Play,
  Settings,
  Database,
  Eye
} from 'lucide-react';

const TrueSingleScreenLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showPlayButton, setShowPlayButton] = React.useState(false);

  const tabs = [
    { id: 'overview', label: 'סקירה', icon: Brain },
    { id: 'features', label: 'תכונות', icon: Target },
    { id: 'security', label: 'אבטחה', icon: Shield },
    { id: 'cta', label: 'התחל', icon: Zap }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Left Side - Text and Features */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    ISHEBOT - מערכת חכמה
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    טכנולוגיה מתקדמת לניהול כיתה אופטימלי
                  </p>
                  <div className="space-y-2">
                    {[
                      'אלגוריתם גנטי מתקדם (CSP)',
                      '6 מבני כיתה שונים',
                      '50+ נקודות נתונים לתלמיד',
                      'שיפור אוטומטי בכל דור'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Metrics Grid */}
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-3">
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
                      className={`bg-gradient-to-br ${stat.color} p-4 rounded-lg text-white text-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-xl font-bold">{stat.value}</div>
                      <div className="text-xs opacity-90">{stat.label}</div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full overflow-y-auto"
          >
            <div className="grid grid-cols-3 gap-3 h-full">
              {[
                {
                  icon: Brain,
                  title: 'אלגוריתם CSP',
                  description: 'אופטימיזציה מדעית',
                  features: ['חישוב תואמות', 'ציון איכות'],
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Target,
                  title: '6 מבני כיתה',
                  description: 'גמישות מלאה',
                  features: ['שורות', 'אשכולות', 'U-Shape'],
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: BarChart3,
                  title: 'ניתוח מתקדם',
                  description: '50+ נקודות נתונים',
                  features: ['התנהגות', 'ביצועים'],
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Clock,
                  title: 'חיסכון זמן',
                  description: 'אוטומציה מלאה',
                  features: ['סידור אוטומטי', 'דוחות מיידיים'],
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: Settings,
                  title: 'התאמה אישית',
                  description: 'התאמה לצרכים',
                  features: ['העדפות', 'גמישות'],
                  color: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: Database,
                  title: 'אחסון מאובטח',
                  description: 'נתונים מוגנים',
                  features: ['הצפנה', 'גיבוי'],
                  color: 'from-red-500 to-pink-500'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg flex flex-col"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-2 self-center`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 text-center">{feature.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 text-center">{feature.description}</p>
                  <div className="mt-auto space-y-1">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-1 rtl:space-x-reverse">
                        <div className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 text-xs">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Security Rating Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white col-span-1 flex flex-col justify-center items-center text-center shadow-xl"
              >
                <Shield className="w-12 h-12 mb-3" />
                <div className="text-3xl font-bold mb-1">9.5/10</div>
                <div className="text-sm opacity-90 mb-3">Enterprise Security</div>
                <div className="text-xs opacity-80">ISO 27001 Compliant</div>
              </motion.div>

              {/* Security Features Grid */}
              <div className="col-span-2 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Lock,
                    title: 'הגנה מפני האקינג',
                    features: ['AES-256', 'CSRF Tokens', 'Rate Limiting', 'Bot Detection']
                  },
                  {
                    icon: Shield,
                    title: 'פרטיות מידע',
                    features: ['Secure Access', 'Privacy Policy', 'Auto Backup', 'Secure Deletion']
                  },
                  {
                    icon: Eye,
                    title: 'ניטור בזמן אמת',
                    features: ['Threat Detection', 'Risk Reports', 'Access Control', 'Secure Logs']
                  },
                  {
                    icon: CheckCircle,
                    title: 'תאימות תקנים',
                    features: ['GDPR', 'SOC 2', 'ISO 27001', 'HIPAA Ready']
                  }
                ].map((security, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                      <div className="p-1 bg-green-100 rounded">
                        <security.icon className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{security.title}</h3>
                    </div>
                    <div className="space-y-1">
                      {security.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-1 rtl:space-x-reverse">
                          <div className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0" />
                          <span className="text-gray-700 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Security Dashboard Button */}
            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/security-dashboard')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm shadow-lg"
              >
                <Shield className="w-4 h-4" />
                <span>לוח בקרת אבטחה</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      case 'cta':
        return (
          <motion.div
            key="cta"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col justify-center items-center text-center"
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-xl text-white max-w-md shadow-2xl">
              <Zap className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4">
                התחל עכשיו
              </h2>
              <p className="text-lg mb-6 opacity-90">
                חווה את המערכת החכמה לניהול כיתה
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-bold text-lg shadow-xl"
                >
                  כניסה למערכת
                </button>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg p-3">
                    <Users className="w-6 h-6 mx-auto mb-1" />
                    <div>50+ תלמידים</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <Clock className="w-6 h-6 mx-auto mb-1" />
                    <div>חיסכון זמן</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                ISHEBOT
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPlayButton(!showPlayButton)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 border-b-2 font-medium text-sm transition-colors flex items-center space-x-1 rtl:space-x-reverse ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Fixed Height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden">
            <div className="h-full p-6">
              <AnimatePresence mode="wait">
                <TabContent />
              </AnimatePresence>
            </div>
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
              className="bg-white rounded-xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">הכר את ISHEBOT</h3>
                  <button
                    onClick={() => setShowPlayButton(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">סרטון הדגמה יופיע כאן</p>
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

export default TrueSingleScreenLandingPage;