import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, FileSignature } from 'lucide-react';
import Footer from '../components/ui/Footer';

const DataProcessingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">ISHEBOT - מערכת ניתוח תלמידים</h1>
            </div>
            <Link to="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors">
              <span>חזרה לדשבורד</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 sm:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <FileSignature className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">הסכם עיבוד נתונים</h1>
            <p className="text-slate-300 text-lg">Data Processing Agreement (DPA)</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
              <span>תאריך עדכון: ינואר 2025</span>
              <span>•</span>
              <span>גרסה: 1.0</span>
            </div>
          </div>

          <hr className="border-slate-600 my-8" />

          <div className="prose prose-invert prose-slate max-w-none">

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">1. הגדרות</h2>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <dl className="space-y-3 text-slate-300">
                  <div>
                    <dt className="font-semibold text-blue-300">בעל הנתונים (Data Controller):</dt>
                    <dd className="mr-4">בית הספר - האחראי הסופי על הנתונים</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">מעבד הנתונים (Data Processor):</dt>
                    <dd className="mr-4">ISHEBOT - מעבד נתונים מטעם בית הספר</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">נתונים אישיים:</dt>
                    <dd className="mr-4">קוד תלמיד, שם, כיתה, תשובות שאלון, ניתוח AI</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">2. תפקיד ISHEBOT</h2>
              <p className="text-slate-300 mb-3">ISHEBOT פועלת <strong>אך ורק</strong> כמעבד נתונים:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>מעבדת נתונים רק לפי הוראות בית הספר</li>
                <li>אינה בעלת הנתונים - בית הספר שומר על בעלות מלאה</li>
                <li>לא משתמשת בנתונים למטרות אחרות (פרסום, מכירה, מחקר)</li>
                <li>מחזירה או מוחקת נתונים לפי דרישת בית הספר</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">3. התחייבויות ISHEBOT</h2>
              <div className="grid gap-3">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                  <h3 className="font-semibold text-green-300 mb-2">אבטחת מידע</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>הצפנה מלאה (TLS 1.3, AES-256)</li>
                    <li>בקרת גישה - רק משתמשים מורשים</li>
                    <li>ניטור אבטחה 24/7</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                  <h3 className="font-semibold text-blue-300 mb-2">דיווח על דליפות</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>הודעה תוך 24 שעות מגילוי אירוע אבטחה</li>
                    <li>סיוע בחקירה ותיקון</li>
                    <li>דיווח לרשויות אם נדרש על פי חוק</li>
                  </ul>
                </div>
                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
                  <h3 className="font-semibold text-purple-300 mb-2">סודיות</h3>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1 mr-4">
                    <li>כל העובדים חתומים על הסכמי סודיות (NDA)</li>
                    <li>גישה מוגבלת לפי עקרון "צורך לדעת"</li>
                    <li>לא משתפים נתונים עם צדדים שלישיים (מלבד Google, OpenAI)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">4. זכויות בית הספר</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li><strong>בעלות מלאה:</strong> בית הספר הוא הבעלים הבלעדי של כל הנתונים</li>
                <li><strong>זכות עיון:</strong> לראות את כל הנתונים בכל עת</li>
                <li><strong>זכות ביקורת:</strong> לבקר את מערכות ISHEBOT פעם בשנה (בתיאום מראש)</li>
                <li><strong>זכות מחיקה:</strong> לדרוש מחיקת נתונים בכל עת - ביצוע תוך 30 יום</li>
                <li><strong>זכות לייצוא:</strong> לקבל את הנתונים בפורמט JSON או Excel</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">5. מעבדי משנה (Sub-Processors)</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="border border-slate-600 px-4 py-2 text-right">שם החברה</th>
                    <th className="border border-slate-600 px-4 py-2 text-right">תפקיד</th>
                    <th className="border border-slate-600 px-4 py-2 text-right">מיקום</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr>
                    <td className="border border-slate-600 px-4 py-2">Google LLC</td>
                    <td className="border border-slate-600 px-4 py-2">אחסון (Google Sheets)</td>
                    <td className="border border-slate-600 px-4 py-2">ישראל/EU</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-4 py-2">OpenAI</td>
                    <td className="border border-slate-600 px-4 py-2">ניתוח AI</td>
                    <td className="border border-slate-600 px-4 py-2">USA</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-slate-400 text-sm mt-3">
                * בית הספר יקבל הודעה מראש על כל שינוי במעבדי המשנה
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">6. סיום הסכם</h2>
              <div className="bg-amber-900/20 border border-amber-700/50 p-4 rounded-lg">
                <p className="text-slate-300 mb-3">במקרה של סיום החוזה:</p>
                <ol className="list-decimal list-inside text-slate-300 space-y-2 mr-4">
                  <li>ISHEBOT תחזיר את כל הנתונים בפורמט מובנה (JSON/Excel) תוך 30 יום</li>
                  <li>ISHEBOT תמחק את כל הנתונים ממערכותיה תוך 90 יום</li>
                  <li>ISHEBOT תספק אישור בכתב על המחיקה</li>
                  <li>גיבויים יימחקו גם כן</li>
                </ol>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">7. יצירת קשר</h2>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-700/50">
                <dl className="space-y-2 text-slate-300">
                  <div>
                    <dt className="font-semibold text-blue-300">מעבד נתונים:</dt>
                    <dd className="mr-4">ISHEBOT - מערכת ניתוח תלמידים בע"מ</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">אימייל:</dt>
                    <dd className="mr-4">
                      <a href="mailto:wardwas3107@gmail.com" className="text-blue-400 hover:underline">
                        wardwas3107@gmail.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300">כתובת:</dt>
                    <dd className="mr-4">חיפה, ישראל</dd>
                  </div>
                </dl>
              </div>
            </section>

          </div>

          <hr className="border-slate-600 my-8" />
          <div className="text-center text-sm text-slate-400">
            <p><strong>גרסה:</strong> 1.0 | <strong>תאריך:</strong> ינואר 2025</p>
            <p className="mt-2"><strong>חברה:</strong> ISHEBOT - מערכת ניתוח תלמידים בע"מ</p>
          </div>
        </div>
      </main>

      <Footer className="mt-12" />
    </div>
  );
};

export default DataProcessingPage;
