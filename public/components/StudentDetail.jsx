import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { studentAPI } from "../api";
import "./StudentDetail.css";

function StudentDetail() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getStudent(studentId);

      if (data.error) {
        setError(data.error);
      } else {
        setStudent(data);
      }
    } catch (err) {
      setError("שגיאה בטעינת הנתונים");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="loading">⏳ טוען נתונים...</div>;
  }

  if (error || !student) {
    return (
      <div className="container">
        <div className="error">
          <h2>❌ שגיאה</h2>
          <p>{error || "תלמיד לא נמצא"}</p>
          <Link to="/" className="back-btn">
            ← חזרה לדשבורד
          </Link>
        </div>
      </div>
    );
  }

  const summary = student.student_summary || {};
  const insights = student.insights || [];
  const actions = student.immediate_actions || [];
  const seating = student.seating_arrangement || {};

  return (
    <div className="container">
      <div className="student-detail">
        <div className="detail-header">
          <div className="header-content">
            <Link to="/" className="back-link">
              ← חזרה לדשבורד
            </Link>
            <h1>{student.name || `תלמיד ${student.studentCode}`}</h1>
            <div className="header-meta">
              <span>קוד: {student.studentCode}</span>
              <span>|</span>
              <span>כיתה: {student.classId}</span>
              <span>|</span>
              <span>רבעון: {student.quarter}</span>
            </div>
          </div>
          <button onClick={handlePrint} className="print-btn">
            🖨️ הדפס
          </button>
        </div>

        <section className="detail-section learning-section">
          <h2>🎯 סגנון למידה</h2>
          <div className="learning-style-box">
            <p style={{ whiteSpace: "pre-line" }}>{summary.learning_style}</p>
          </div>
          {summary.key_notes && (
            <div className="key-notes-box">
              <strong>💡 הערות מפתח:</strong>
              <p>{summary.key_notes}</p>
            </div>
          )}
        </section>

        <section className="detail-section profile-section">
          <h2>⚖️ פרופיל התלמיד</h2>
          <div className="profile-grid">
            <div className="profile-box strengths">
              <h3>💪 חוזקות</h3>
              <ul>
                {(summary.strengths || []).map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
            <div className="profile-box challenges">
              <h3>🎯 אתגרים</h3>
              <ul>
                {(summary.challenges || []).map((challenge, i) => (
                  <li key={i}>{challenge}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="detail-section insights-section">
          <h2>🔍 תובנות פדגוגיות</h2>
          {insights.map((insight, i) => (
            <div key={i} className="insight-card">
              <h3>{insight.category}</h3>
              <div className="insight-finding">
                <strong>תובנה:</strong>
                <p>{insight.finding}</p>
              </div>
              <div className="insight-recommendations">
                <strong>המלצות מעשיות:</strong>
                <div style={{ whiteSpace: "pre-line", marginTop: "10px" }}>
                  {insight.recommendations}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="detail-section actions-section">
          <h2>⚡ פעולות מיידיות - להתחיל היום</h2>
          <div className="actions-grid">
            {actions.map((action, i) => (
              <div key={i} className="action-card">
                <div className="action-number">{i + 1}</div>
                <div
                  className="action-content"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {action}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section seating-section">
          <h2>🪑 המלצות לסידור ישיבה</h2>
          <div className="seating-grid">
            <div className="seating-card">
              <div className="seating-icon">📍</div>
              <h3>מיקום</h3>
              <p>{seating.location}</p>
            </div>
            <div className="seating-card">
              <div className="seating-icon">👥</div>
              <h3>סוג שותף</h3>
              <p>{seating.partner_type}</p>
            </div>
            <div className="seating-card">
              <div className="seating-icon">⚠️</div>
              <h3>להימנע</h3>
              <p>{seating.avoid}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StudentDetail;
