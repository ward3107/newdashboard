import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Key, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import Footer from '../components/ui/Footer';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">ISHEBOT - מערכת ניתוח תלמידים</h1>
            </div>
            <Link to="/dashboard" className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
              <span>חזרה לדשבורד</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 sm:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">הצהרת אבטחת מידע</h1>
            <p className="text-slate-300 text-lg">Information Security Declaration</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
              <span>תאריך עדכון: ינואר 2025</span>
              <span>•</span>
              <span>גרסה: 1.0</span>
            </div>
          </div>

          <hr className="border-slate-600 my-8" />

          <div className="prose prose-invert prose-slate max-w-none">

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Server className="w-6 h-6" />
                1. תשתית אחסון
              </h2>
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-700/30">
                <dl className="space-y-3 text-slate-300">
                  <div>
                    <dt className="font-semibold text-blue-300">פלטפורמה:</dt>
                    <dd className="mr-4">Google Cloud Platform (GCP)</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">מיקום שרתים:</dt>
                    <dd className="mr-4">ישראל / איחוד אירופי בלבד</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">אחסון נתונים:</dt>
                    <dd className="mr-4">Google Sheets (מאובטח)</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">תקני אבטחה:</dt>
                    <dd className="mr-4">ISO 27001, SOC 2 Type II, ISO 27018</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6" />
                2. הצפנה
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-900/20 p-5 rounded-lg border border-green-700/30">
                  <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    הצפנה בזמן העברה (In Transit)
                  </h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li><strong>פרוטוקול:</strong> TLS 1.3</li>
                    <li><strong>אלגוריתם:</strong> AES-256-GCM</li>
                    <li><strong>HTTPS</strong> בכל החיבורים</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-700/30">
                  <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    הצפנה בזמן אחסון (At Rest)
                  </h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li><strong>אלגוריתם:</strong> AES-256</li>
                    <li><strong>מפתחות:</strong> מנוהלים על ידי Google KMS</li>
                    <li><strong>גיבויים:</strong> מוצפנים במלואם</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Key className="w-6 h-6" />
                3. בקרת גישה
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">עקרון "צורך לדעת" (Need-to-Know)</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>רק משתמשים מורשים יכולים לגשת למידע</li>
                    <li>מורים רואים רק תלמידים מבית הספר שלהם</li>
                    <li>צוות ISHEBOT אינו רואה נתוני תלמידים</li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">אימות משתמשים</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>OAuth 2.0 (Google Sign-In)</li>
                    <li>אימות דו-שלבי (2FA) זמין</li>
                    <li>סיסמאות מוצפנות (bcrypt)</li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">לוגים ותיעוד</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>כל גישה למידע מתועדת</li>
                    <li>שמירת לוגים למשך 90 יום</li>
                    <li>ניתוח אנומליות אוטומטי</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                4. ניטור ואבטחה פעילה
              </h2>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-green-300">ניטור 24/7</strong>
                    <p className="text-slate-300 text-sm">מערכות ניטור אוטומטיות לזיהוי איומים בזמן אמת</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-green-300">עדכוני אבטחה</strong>
                    <p className="text-slate-300 text-sm">עדכונים אוטומטיים לסגירת פרצות אבטחה</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-green-300">גיבויים יומיים</strong>
                    <p className="text-slate-300 text-sm">גיבוי מוצפן כל 24 שעות, שמירה למשך 90 יום</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-900/20 p-3 rounded-lg border border-green-700/30">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-green-300">Firewall ו-DDoS Protection</strong>
                    <p className="text-slate-300 text-sm">הגנה מפני התקפות סייבר (Google Cloud Armor)</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                5. תגובה לאירועי אבטחה
              </h2>
              <div className="bg-amber-900/20 border border-amber-700/50 p-6 rounded-lg">
                <p className="text-slate-300 mb-4">
                  במקרה של חשש לפריצת אבטחה או דליפת מידע, ISHEBOT פועלת לפי תוכנית תגובה:
                </p>
                <ol className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-amber-400">שלב 1:</span>
                    <div>
                      <strong>זיהוי (תוך 1 שעה)</strong>
                      <p className="text-sm text-slate-400">מערכות ניטור מזהות אנומליות וחריגות</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-amber-400">שלב 2:</span>
                    <div>
                      <strong>בידוד (תוך 2 שעות)</strong>
                      <p className="text-sm text-slate-400">הפסקת האיום וסגירת פרצות</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-amber-400">שלב 3:</span>
                    <div>
                      <strong>חקירה (תוך 12 שעות)</strong>
                      <p className="text-sm text-slate-400">הבנת היקף הנזק ומניעת הישנות</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-amber-400">שלב 4:</span>
                    <div>
                      <strong>הודעה (תוך 24 שעות)</strong>
                      <p className="text-sm text-slate-400">דיווח לבית הספר ולרשויות (אם נדרש)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-amber-400">שלב 5:</span>
                    <div>
                      <strong>תיקון ושיקום</strong>
                      <p className="text-sm text-slate-400">שיקום מערכות וחיזוק אבטחה</p>
                    </div>
                  </li>
                </ol>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">6. תקנים ותאימות</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">תאימות נוכחית</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>חוק הגנת הפרטיות הישראלי</li>
                    <li>תיקון 13 (חינוך)</li>
                    <li>עקרונות GDPR</li>
                    <li>Google Cloud: ISO 27001, SOC 2</li>
                  </ul>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">מטרות עתידיות</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>הסמכת ISO 27001 מלאה</li>
                    <li>SOC 2 Type II</li>
                    <li>ISO 27701 (Privacy)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">7. יצירת קשר לנושאי אבטחה</h2>
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-6 rounded-lg border border-red-700/50">
                <p className="text-slate-200 mb-3 font-semibold">במקרה של חשד לפרצת אבטחה:</p>
                <dl className="space-y-2 text-slate-300">
                  <div>
                    <dt className="font-semibold text-red-300">אימייל דחוף:</dt>
                    <dd className="mr-4">
                      <a href="mailto:wardwas3107@gmail.com" className="text-red-400 hover:underline">
                        wardwas3107@gmail.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-red-300">נושא:</dt>
                    <dd className="mr-4">[SECURITY ALERT] - תיאור הבעיה</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-red-300">זמן תגובה:</dt>
                    <dd className="mr-4">תוך 2 שעות (24/7)</dd>
                  </div>
                </dl>
              </div>
            </section>

          </div>

          <hr className="border-slate-600 my-8" />
          <div className="text-center text-sm text-slate-400">
            <p><strong>גרסה:</strong> 1.0 | <strong>תאריך:</strong> ינואר 2025</p>
            <p className="mt-2"><strong>חברה:</strong> ISHEBOT - מערכת ניתוח תלמידים בע"מ</p>
            <p className="mt-1">
              <strong>איש קשר:</strong>{' '}
              <a href="mailto:wardwas3107@gmail.com" className="text-blue-400 hover:underline">
                wardwas3107@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer className="mt-12" />
    </div>
  );
};

export default SecurityPage;
