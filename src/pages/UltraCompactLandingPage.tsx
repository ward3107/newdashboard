import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Shield,
  Target,
  Sparkles,
  Zap,
  CheckCircle,
  ArrowRight,
  Lock,
  Users,
  TrendingUp
} from 'lucide-react';

const UltraCompactLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'סקירה', icon: Brain },
    { id: 'features', label: 'תכונות', icon: Target },
    { id: 'security', label: 'אבטחה', icon: Shield },
    { id: 'start', label: 'התחל', icon: Zap }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-6"
          >
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Left: Main Info */}
              <div className="col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  ISHEBOT
                </h1>
                <p className="text-gray-600 mb-4 text-sm">מערכת חכמה לניהול כיתה אופטימלי</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { icon: Brain, title: 'אלגוריתם CSP', desc: 'אופטימיזציה מתקדמת' },
                    { icon: Target, title: '6 מבנים', desc: 'גמישות מלאה' },
                    { icon: Users, title: '50+ תלמידים', desc: 'ניתוח אישי' },
                    { icon: Zap, title: '98% מהירות', desc: 'ביצועים משופרים' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-2 rtl:space-x-reverse">
                      <item.icon className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm shadow-lg"
                  >
                    כניסה למערכת
                  </button>
                  <button
                    onClick={() => navigate('/assessment')}
                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold text-sm"
                  >
                    התחל הערכה
                  </button>
                </div>
              </div>

              {/* Right: Security Card */}
              <div className="flex flex-col justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white text-center shadow-2xl"
                >
                  <Shield className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">9.5/10</div>
                  <div className="text-sm opacity-90 mb-2">Enterprise Security</div>
                  <button
                    onClick={() => navigate('/security-dashboard')}
                    className="w-full px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all text-xs font-medium"
                  >
                    צפה באבטחה →
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'features':
        return (
          <motion.div
            key="features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">תכונות מתקדמות</h2>
            <div className="grid grid-cols-4 gap-3 h-full">
              {[
                { icon: Brain, title: 'CSP אלגוריתם', features: ['50+ נקודות', 'אופטימיזציה', 'למידה'] },
                { icon: Target, title: '6 מבני כיתה', features: ['שורות', 'אשכולות', 'U-Shape', 'מעגל'] },
                { icon: TrendingUp, title: 'ניתוח מתקדם', features: ['דינמיקה', 'ביצועים', 'תובנות'] },
                { icon: Zap, title: 'אוטומציה', features: ['סידור', 'דוחות', 'שיפור'] },
                { icon: Users, title: 'התאמה אישית', features: ['העדפות', 'צרכים', 'גמישות'] },
                { icon: Sparkles, title: 'למידה חכמה', features: ['AI', 'מכונה', 'התפתחות'] },
                { icon: Lock, title: 'פרטיות', features: ['הצפנה', 'גישה', 'הגנה'] },
                { icon: CheckCircle, title: 'תקנים', features: ['GDPR', 'SOC 2', 'ISO 27001'] }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white mb-3 mx-auto">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-center mb-2">{feature.title}</h3>
                  <div className="space-y-1">
                    {feature.features.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-1 rtl:space-x-reverse">
                        <div className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0" />
                        <span className="text-xs text-gray-600">{item}</span>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full p-6"
          >
            <div className="h-full grid grid-cols-3 gap-4">
              {/* Security Rating - Takes 1/3 */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white flex flex-col justify-center items-center text-center shadow-2xl">
                <Shield className="w-16 h-16 mb-3 text-yellow-300" />
                <div className="text-4xl font-bold mb-2">9.5/10</div>
                <div className="text-sm font-medium mb-3">Enterprise Security Rating</div>
                <div className="text-xs opacity-80 space-y-1">
                  <div>✓ AES-256 Encryption</div>
                  <div>✓ AI Threat Detection</div>
                  <div>✓ Real-time Monitoring</div>
                  <div>✓ ISO 27001 Compliant</div>
                </div>
              </div>

              {/* Security Features - Takes 2/3 */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-3 h-full">
                  {[
                    { title: 'הגנה מפני האקינג', items: ['CSRF Tokens', 'Rate Limiting', 'Bot Detection'] },
                    { title: 'פרטיות מידע', items: ['Secure Access', 'Data Encryption', 'Privacy Controls'] },
                    { title: 'ניטור בזמן אמת', items: ['Threat Detection', 'Security Logs', 'Alerts'] },
                    { title: 'תאימות תקנים', items: ['GDPR', 'SOC 2', 'HIPAA Ready'] }
                  ].map((section, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg">
                      <h3 className="font-bold text-sm text-gray-900 mb-3">{section.title}</h3>
                      <div className="space-y-2">
                        {section.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 rtl:space-x-reverse">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/security-dashboard')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
              >
                <Shield className="w-5 h-5" />
                <span>פתח לוח בקרת אבטחה</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 'start':
        return (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full p-6 flex flex-col justify-center items-center"
          >
            <div className="text-center max-w-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
                <Zap className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                בוא לעתיד החינוך
              </h2>

              <p className="text-gray-600 mb-8">
                חווה את מערכת ISHEBOT - הפתרון המתקדם לניהול כיתה חכם
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Users, value: '50+', label: 'תלמידים' },
                  { icon: Target, value: '6', label: 'מבנים' },
                  { icon: Shield, value: '9.5/10', label: 'אבטחה' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-2">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-xl"
                >
                  כניסה למערכת
                </button>
                <button
                  onClick={() => navigate('/assessment')}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all font-bold text-lg"
                >
                  התחל הערכה
                </button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden">
      {/* Ultra Compact Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                ISHEBOT
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Ultra Compact Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-3 border-b-2 font-medium text-xs transition-colors flex items-center space-x-1 rtl:space-x-reverse ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Uses remaining height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <AnimatePresence mode="wait">
            <TabContent />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UltraCompactLandingPage;