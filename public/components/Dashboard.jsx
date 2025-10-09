import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../api';
import './Dashboard.css';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, statsData] = await Promise.all([
        studentAPI.getAllStudents(),
        studentAPI.getStats()
      ]);

      setStudents(studentsData.students || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('שגיאה בטעינת הנתונים. נא לוודא שה-API URL נכון בקובץ config.js');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode?.toString().includes(searchTerm);

    const matchesClass = classFilter === 'all' || student.classId === classFilter;

    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map(s => s.classId))].sort();

  if (loading) {
    return <div className="loading">⏳ טוען נתונים...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>❌ שגיאה</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="retry-btn">🔄 נסה שוב</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard">
        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>סה"כ תלמידים</h3>
                <p className="stat-number">{stats.totalStudents}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏫</div>
              <div className="stat-content">
                <h3>כיתות</h3>
                <p className="stat-number">{Object.keys(stats.byClass || {}).length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 חפש לפי שם או קוד תלמיד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-box">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">כל הכיתות</option>
              {classes.map(classId => (
                <option key={classId} value={classId}>כיתה {classId}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="students-section">
          <h2>📋 רשימת תלמידים ({filteredStudents.length})</h2>

          {filteredStudents.length === 0 ? (
            <div className="no-results">
              <p>😕 לא נמצאו תלמידים</p>
            </div>
          ) : (
            <div className="students-grid">
              {filteredStudents.map(student => (
                <Link
                  key={student.studentCode}
                  to={`/student/${student.studentCode}`}
                  className="student-card"
                >
                  <div className="student-header">
                    <h3>{student.name || `תלמיד ${student.studentCode}`}</h3>
                    <span className="student-code">#{student.studentCode}</span>
                  </div>

                  <div className="student-meta">
                    <span className="meta-item">🏫 כיתה {student.classId}</span>
                    <span className="meta-item">📅 {student.quarter}</span>
                  </div>

                  <div className="student-summary">
                    <p className="learning-style">
                      {student.learningStyle?.substring(0, 60)}
                      {student.learningStyle?.length > 60 ? '...' : ''}
                    </p>
                  </div>

                  <div className="student-stats">
                    <span className="stat-badge">💪 {student.strengthsCount} חוזקות</span>
                    <span className="stat-badge challenge">🎯 {student.challengesCount} אתגרים</span>
                  </div>

                  <div className="student-action">
                    <span className="view-btn">👁️ צפה בניתוח המלא</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;