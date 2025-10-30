import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Users,
  Zap,
  Globe,
  Shield,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Target,
  Heart,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            {/* Logo/Brand */}
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl">
                <Brain size={48} className="animate-pulse" />
                <span className="text-4xl font-bold">ISHEBOT</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              העתיד של ניהול כיתה
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                כבר כאן
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              אלגוריתם גנטי מתקדם המנתח <span className="font-bold text-purple-600">50+ נקודות נתונים</span> ומוצא את סידור הכיתה האופטימלי ביותר
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <button
                onClick={() => navigate('/dashboard')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles size={24} />
                  התחל עכשיו - חינם
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-purple-400 transform hover:scale-105 transition-all duration-300"
              >
                למד עוד
              </button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={staggerChildren}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
            >
              {[
                { icon: Clock, label: 'חוסך 10 שעות', sublabel: 'שבועיות' },
                { icon: Brain, label: 'אלגוריתם גנטי', sublabel: 'מתקדם' },
                { icon: Target, label: '6 מבני כיתה', sublabel: 'שונים' },
                { icon: Globe, label: '4 שפות', sublabel: 'נתמכות' },
                { icon: Shield, label: 'תואם תיקון 13', sublabel: 'מאובטח' },
                { icon: CheckCircle, label: 'נגישות מלאה', sublabel: 'WCAG 2.1' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-bold text-gray-900">{stat.label}</div>
                  <div className="text-xs text-gray-600">{stat.sublabel}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              הפתרון החכם המתקדם בעולם
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              טכנולוגיה מתקדמת שמשנה את הדרך שבה מורים מנהלים את הכיתה
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'אלגוריתם גנטי מתקדם (CSP)',
                description: 'אופטימיזציה מדעית של סידור ישיבה',
                features: [
                  'ניתוח 50+ נקודות נתונים לכל תלמיד',
                  'חישוב תואמות בין זוגות תלמידים',
                  'ציון איכות למיקום כל תלמיד',
                  'שיפור אוטומטי בכל דור'
                ],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Target,
                title: '6 מבני כיתה שונים',
                description: 'גמישות מלאה לכל סוג שיעור',
                features: [
                  'שורות מסורתיות להרצאות',
                  'אשכולות לעבודה קבוצתית',
                  'U-Shape לדיונים',
                  'מעגל לשיח פתוח',
                  'זוגות ללמידה עמיתים',
                  'גמיש להתאמה אישית'
                ],
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Sparkles,
                title: 'ניתוח מיקום חכם',
                description: 'הסבר מפורט לכל החלטה',
                features: [
                  'הסבר למה כל תלמיד יושב איפה שהוא',
                  'ניתוח לפי שורה (קדמי/אחורי)',
                  'התחשבות במיקום (דלת/חלון)',
                  'המלצות מותאמות אישית'
                ],
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: TrendingUp,
                title: 'לוח בקרה פוטוריסטי',
                description: 'תובנות בזמן אמת',
                features: [
                  'גרפים ויזואליים אינטראקטיביים',
                  'דוחות מקצועיים להורדה',
                  'מעקב אחר התקדמות',
                  'מצב כהה/בהיר'
                ],
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: Globe,
                title: 'תמיכה רב-לשונית',
                description: '4 שפות נתמכות',
                features: [
                  'עברית (תמיכה RTL מלאה)',
                  'אנגלית',
                  'ערבית',
                  'רוסית',
                  'מעבר קל בין שפות'
                ],
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Shield,
                title: 'נגישות ואבטחה',
                description: 'תקנים מחמירים',
                features: [
                  'תואם WCAG 2.1',
                  'תואם תיקון 13',
                  'הצפנה ברמה בנקאית',
                  'אחסון בישראל'
                ],
                color: 'from-teal-500 to-cyan-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">למה ISHEBOT?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              יתרונות ממשיים למורים, תלמידים ובתי ספר
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'למורים',
                benefits: [
                  'חיסכון של 10 שעות שבועיות',
                  'החלטות מבוססות אלגוריתם מדעי',
                  'תשומת לב אישית לכל תלמיד',
                  'הפחתת לחץ עם אוטומציה',
                  'הבנה מדויקת למיקום כל תלמיד',
                  'תמיכה ב-4 שפות'
                ]
              },
              {
                title: 'לתלמידים',
                benefits: [
                  'מיקום אופטימלי מבוסס מדע',
                  'זיווג חכם עם חברים תואמים',
                  'תמיכה מותאמת לסגנון למידה',
                  'שיפור בתוצאות עד 40%',
                  'סביבה תומכת ומותאמת',
                  'ריכוז גבוה יותר'
                ]
              },
              {
                title: 'לבתי ספר',
                benefits: [
                  'שיפור ניהול כיתה',
                  'עמידה בתקנים (תיקון 13)',
                  'תיעוד מקצועי אוטומטי',
                  'דוחות להורים ולהנהלה',
                  'גמישות רב-לשונית',
                  'נגישות מלאה'
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <h3 className="text-2xl font-bold mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-50">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              מוכנים לחוות את עתיד ניהול הכיתה?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              הצטרפו למורים שמשתמשים באלגוריתם גנטי מתקדם לסידור כיתה אופטימלי
              <br />
              חסכו 10 שעות שבועיות עם AI חכם שמבין כל תלמיד
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-2xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">התחל עכשיו - חינם</span>
              <Sparkles className="w-8 h-8 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <p className="mt-6 text-gray-400 text-sm">
              לא נדרש כרטיס אשראי • התחלה מיידית • תמיכה מלאה
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain size={32} className="text-purple-400" />
              <span className="text-2xl font-bold text-white">ISHEBOT</span>
            </div>
            <p className="text-gray-400 mb-8">
              העתיד של ניהול כיתה - מופעל על ידי אלגוריתם גנטי מתקדם
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <a href="/privacy-policy" className="hover:text-white transition-colors">מדיניות פרטיות</a>
              <a href="/terms" className="hover:text-white transition-colors">תנאי שימוש</a>
              <a href="/security" className="hover:text-white transition-colors">אבטחה</a>
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">התחבר</button>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 ISHEBOT Ltd. כל הזכויות שמורות
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
