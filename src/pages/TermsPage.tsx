import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, AlertCircle } from 'lucide-react';
import Footer from '../components/ui/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">ISHEBOT - מערכת ניתוח תלמידים</h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors"
            >
              <span>חזרה לדשבורד</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 sm:p-12">

          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">תנאי שימוש</h1>
            <p className="text-slate-300 text-lg">ISHEBOT - מערכת ניתוח תלמידים בע"מ</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-400">
              <span>תאריך עדכון אחרון: ינואר 2025</span>
              <span>•</span>
              <span>גרסה: 1.0</span>
            </div>
          </div>

          <hr className="border-slate-600 my-8" />

          {/* Content */}
          <div className="prose prose-invert prose-slate max-w-none">

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">1.</span> מבוא
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                תנאי שימוש אלו מסדירים את השימוש במערכת <strong>ISHEBOT - מערכת ניתוח תלמידים בע"מ</strong> על ידי בתי ספר, מורים, תלמידים והורים.
              </p>
              <p className="text-slate-300 leading-relaxed">
                השימוש במערכת מהווה הסכמה מלאה לתנאים אלו. אם אינך מסכים לתנאים, אנא הימנע משימוש במערכת.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">2.</span> שירותי המערכת
              </h2>
              <p className="text-slate-300 mb-3">מערכת ISHEBOT מספקת:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>ניתוח פדגוגי של תלמידים באמצעות בינה מלאכותית</li>
                <li>המלצות מעשיות למורים לשיפור הוראה</li>
                <li>זיהוי תלמידים הזקוקים לתמיכה נוספת</li>
                <li>מעקב אחר התקדמות תלמידים לאורך זמן</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">3.</span> שימוש מורשה
              </h2>
              <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg mb-4">
                <p className="text-green-300 font-semibold mb-2">מותר לך:</p>
                <ul className="list-disc list-inside text-green-200 text-sm space-y-1 mr-4">
                  <li>להשתמש במערכת למטרות חינוכיות בלבד</li>
                  <li>לאסוף ולנתח נתוני תלמידים בהסכמת בית הספר וההורים</li>
                  <li>לשתף תובנות עם צוות הוראה מורשה בבית הספר</li>
                  <li>לייצא נתונים למטרות דיווח פנימי בבית הספר</li>
                </ul>
              </div>

              <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
                <p className="text-red-300 font-semibold mb-2">אסור לך:</p>
                <ul className="list-disc list-inside text-red-200 text-sm space-y-1 mr-4">
                  <li>להעתיק, לשכפל או לשנות את קוד המערכת</li>
                  <li>למכור או להשכיר גישה למערכת לצדדים שלישיים</li>
                  <li>להשתמש במידע למטרות מסחריות או פרסומיות</li>
                  <li>לשתף סיסמאות או פרטי כניסה עם משתמשים לא מורשים</li>
                  <li>לנסות לפרוץ או להתחמק ממערכות האבטחה</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">4.</span> אחריות המשתמש
              </h2>
              <p className="text-slate-300 mb-3">בית הספר והמורים מתחייבים:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>לקבל הסכמת הורים לפני איסוף נתוני תלמידים</li>
                <li>להשתמש במידע רק למטרות חינוכיות לגיטימיות</li>
                <li>לשמור על סודיות המידע ולא לשתף אותו עם גורמים לא מורשים</li>
                <li>להודיע ל-ISHEBOT על כל שימוש לא מורשה או חשש לפריצת אבטחה</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">5.</span> זכויות קניין רוחני
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                כל הזכויות במערכת ISHEBOT, לרבות קוד, עיצוב, לוגו וטכנולוגיה, שייכות לחלוטין ל-ISHEBOT בע"מ.
              </p>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-slate-200 text-sm">
                  <strong>בעלות על נתונים:</strong> בית הספר שומר על בעלות מלאה על כל הנתונים שנאספו במערכת.
                  ISHEBOT פועלת רק כמעבד נתונים מטעם בית הספר.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">6.</span> מגבלות אחריות
              </h2>
              <div className="bg-amber-900/20 border border-amber-700/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div className="text-slate-200 text-sm leading-relaxed">
                    <p className="mb-2">
                      ISHEBOT מספקת את המערכת "כמות שהיא" (AS IS). אנו עושים מאמצים לספק שירות אמין ומדויק, אך:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>אין אנו מתחייבים לזמינות 100% של המערכת</li>
                      <li>ניתוחי AI עשויים לכלול אי-דיוקים - יש להשתמש בשיקול דעת מקצועי</li>
                      <li>אין אנו אחראים לנזקים עקיפים או לאובדן נתונים בעקבות כוח עליון</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">7.</span> ביטול חוזה
              </h2>
              <p className="text-slate-300 mb-3">בית הספר רשאי לבטל את השירות:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>בכל עת, בהתראה של 30 יום מראש</li>
                <li>במקרה של הפרת תנאי השימוש על ידי ISHEBOT - באופן מיידי</li>
              </ul>

              <p className="text-slate-300 mb-3 mt-4">ISHEBOT רשאית לבטל את השירות:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>במקרה של הפרת תנאי שימוש על ידי בית הספר</li>
                <li>במקרה של אי-תשלום (אם רלוונטי)</li>
                <li>במקרה של שימוש לא חוקי או מזיק למערכת</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">8.</span> שינויים בתנאי השימוש
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                ISHEBOT רשאית לעדכן את תנאי השימוש מעת לעת. במקרה של שינוי מהותי:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                <li>נשלח הודעה בדוא"ל לכל בתי הספר הרשומים</li>
                <li>נפרסם הודעה במערכת</li>
                <li>יהיה ניתן להתנגד לשינוי ולבטל את השירות תוך 30 יום</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">9.</span> דין החל ושיפוט
              </h2>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-slate-300 space-y-2 mr-4">
                  <li><strong>דין חל:</strong> דיני מדינת ישראל</li>
                  <li><strong>סמכות שיפוטית:</strong> בתי המשפט המוסמכים בישראל</li>
                  <li><strong>שפה:</strong> הגרסה העברית של תנאי שימוש אלו היא המחייבת</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="text-slate-500">10.</span> יצירת קשר
              </h2>
              <p className="text-slate-300 mb-4">לשאלות או בעיות בנוגע לתנאי השימוש:</p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-lg border border-blue-700/50">
                <dl className="space-y-2 text-slate-300">
                  <div>
                    <dt className="font-semibold text-blue-300 inline">חברה: </dt>
                    <dd className="inline">ISHEBOT - מערכת ניתוח תלמידים בע"מ</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300 inline">אימייל: </dt>
                    <dd className="inline">
                      <a href="mailto:wardwas3107@gmail.com" className="text-blue-400 hover:underline">
                        wardwas3107@gmail.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-blue-300 inline">כתובת: </dt>
                    <dd className="inline">חיפה, ישראל</dd>
                  </div>
                </dl>
              </div>
            </section>

          </div>

          {/* Footer Info */}
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

      {/* Footer Component */}
      <Footer className="mt-12" />
    </div>
  );
};

export default TermsPage;
