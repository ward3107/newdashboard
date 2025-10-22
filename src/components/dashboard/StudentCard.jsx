import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Award, Target, ArrowLeft } from 'lucide-react';

/**
 * StudentCard Component - Modern, Minimal Student Display
 * Following Stripe/Linear design principles
 */

const StudentCard = ({ student, index = 0 }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Parse learning styles from string
  const learningStyles = student.learningStyle
    ?.split('\n')
    .map(style => style.replace(/^• /, '').replace(/^[^\s]+ /, '').trim())
    .filter(style => style.length > 0) || [];

  // Get clean text from learning style (remove emojis)
  const getCleanStyleText = (style) => {
    return style.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  };

  // Get color based on index for variety
  const cardColors = [
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' },
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' },
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' },
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' },
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' },
    { bg: '#ffffff', border: '#e5e7eb', shadow: 'rgba(0, 0, 0, 0.1)', textColor: '#1f2937' }
  ];

  const colorTheme = cardColors[index % cardColors.length];

  const cardStyles = {
    display: 'block',
    background: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: '12px',
    padding: 'var(--space-6)',
    textDecoration: 'none',
    color: colorTheme.textColor,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.08)' : '0 2px 4px rgba(0, 0, 0, 0.04)',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    animation: `fadeInUp ${0.2 + index * 0.05}s ease-out`,
    position: 'relative',
    overflow: 'hidden'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid #f5f5f5'
  };

  const titleStyles = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2d3748',
    margin: 0,
    lineHeight: '1.4'
  };

  const subtitleStyles = {
    fontSize: '0.85rem',
    color: '#a0aec0',
    margin: '4px 0 0 0'
  };

  const badgeStyles = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#e9ecff',
    padding: '6px 12px',
    borderRadius: '6px',
    whiteSpace: 'nowrap'
  };

  const tagsContainerStyles = {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
    marginBottom: 'var(--space-4)'
  };

  const tagStyles = {
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--color-gray-600)',
    backgroundColor: 'var(--color-gray-100)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-md)',
    whiteSpace: 'nowrap'
  };

  const descriptionStyles = {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-gray-600)',
    margin: '0 0 var(--space-4) 0',
    lineHeight: 'var(--leading-relaxed)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const statsContainerStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)'
  };

  const statBoxStyles = (type) => ({
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: type === 'strengths' ? '#e6fffa' : '#fff5f5',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)'
  });

  const statValueStyles = (type) => ({
    fontSize: '1.75rem',
    fontWeight: '700',
    color: type === 'strengths' ? '#38b2ac' : '#f56565',
    margin: 0,
    lineHeight: '1'
  });

  const statLabelStyles = {
    fontSize: '0.75rem',
    color: '#718096',
    margin: '6px 0 0 0',
    fontWeight: '500'
  };

  const footerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-gray-500)'
  };

  const dateContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  };

  const viewLinkStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    color: 'var(--color-primary-600)',
    fontWeight: 'var(--font-medium)',
    opacity: isHovered ? 1 : 0,
    transition: 'all var(--transition-base)',
    transform: isHovered ? 'translateX(-4px)' : 'translateX(0)'
  };

  return (
    <Link
      to={`/student/${student.studentCode}`}
      style={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`צפה בפרטי התלמיד ${student.studentCode}`}
    >
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h3 style={titleStyles}>
            תלמיד {student.studentCode}
          </h3>
          <p style={subtitleStyles}>#{student.studentCode}</p>
        </div>

        <span style={badgeStyles}>{student.classId}</span>
      </div>

      {/* Learning Styles Tags */}
      {learningStyles.length > 0 && (
        <div style={tagsContainerStyles}>
          {learningStyles.slice(0, 3).map((style, idx) => (
            <span key={idx} style={tagStyles}>
              {getCleanStyleText(style)}
            </span>
          ))}
          {learningStyles.length > 3 && (
            <span style={tagStyles}>+{learningStyles.length - 3}</span>
          )}
        </div>
      )}

      {/* Description */}
      {student.keyNotes && (
        <p style={descriptionStyles}>{student.keyNotes}</p>
      )}

      {/* Stats - Hybrid Scores or Legacy Counts */}
      {student.scores ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)'
        }}>
          {/* Focus Score */}
          {student.scores.focus && (
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                {'⭐'.repeat(student.scores.focus.stars)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: '600' }}>ריכוז</div>
            </div>
          )}

          {/* Motivation Score */}
          {student.scores.motivation && (
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fef9c3', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                {'⭐'.repeat(student.scores.motivation.stars)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#a16207', fontWeight: '600' }}>מוטיבציה</div>
            </div>
          )}

          {/* Collaboration Score */}
          {student.scores.collaboration && (
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                {'⭐'.repeat(student.scores.collaboration.stars)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6b21a8', fontWeight: '600' }}>שיתוף</div>
            </div>
          )}
        </div>
      ) : (
        <div style={statsContainerStyles}>
          <div style={statBoxStyles('strengths')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Award size={14} color="var(--color-success)" />
              <p style={statValueStyles('strengths')}>{student.strengthsCount || 0}</p>
            </div>
            <p style={statLabelStyles}>חוזקות</p>
          </div>

          <div style={statBoxStyles('challenges')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Target size={14} color="var(--color-warning)" />
              <p style={statValueStyles('challenges')}>{student.challengesCount || 0}</p>
            </div>
            <p style={statLabelStyles}>אתגרים</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={footerStyles}>
        <div style={dateContainerStyles}>
          <Calendar size={12} />
          <span>{student.date}</span>
        </div>

        <div style={viewLinkStyles}>
          <span>צפה בפרטים</span>
          <ArrowLeft size={12} />
        </div>
      </div>
    </Link>
  );
};

// Add keyframe animation
if (typeof document !== 'undefined' && !document.getElementById('student-card-animations')) {
  const style = document.createElement('style');
  style.id = 'student-card-animations';
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default StudentCard;
