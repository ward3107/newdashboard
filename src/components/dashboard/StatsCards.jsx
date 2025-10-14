import React, { useState, useEffect } from 'react';
import { Users, School, TrendingUp, Clock } from 'lucide-react';

/**
 * StatsCards Component - Modern, Minimal Statistics Display
 * Following Stripe/Linear design principles
 */

const StatsCards = ({ stats, loading = false }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalStudents: 0,
    totalClasses: 0,
    averageStrengths: 0,
    lastUpdated: ''
  });

  // Calculate total classes
  const totalClasses = stats?.byClass ? Object.keys(stats.byClass).length : 0;

  // Counter animation effect
  useEffect(() => {
    if (!loading && stats) {
      const duration = 1000; // Faster, more subtle
      const steps = 40;
      const stepDuration = duration / steps;

      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedValues({
          totalStudents: Math.floor(stats.totalStudents * progress),
          totalClasses: Math.floor(totalClasses * progress),
          averageStrengths: (stats.averageStrengths * progress).toFixed(1),
          lastUpdated: stats.lastUpdated || ''
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedValues({
            totalStudents: stats.totalStudents,
            totalClasses: totalClasses,
            averageStrengths: stats.averageStrengths,
            lastUpdated: stats.lastUpdated || ''
          });
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [stats, loading, totalClasses]);

  const cardsData = [
    {
      title: 'סה״כ תלמידים',
      value: loading ? '-' : animatedValues.totalStudents.toLocaleString('he-IL'),
      icon: Users,
      trend: '+12',
      iconBg: 'var(--color-primary-50)',
      iconColor: 'var(--color-primary-600)',
      cardBg: 'linear-gradient(135deg, #17a2b8 0%, #3dd5f3 100%)',
      cardTextColor: '#ffffff'
    },
    {
      title: 'כיתות',
      value: loading ? '-' : animatedValues.totalClasses,
      icon: School,
      trend: '+5',
      iconBg: 'var(--color-teal-bg)',
      iconColor: 'var(--color-teal)',
      cardBg: 'linear-gradient(135deg, #4267B2 0%, #5b7bc5 100%)',
      cardTextColor: '#ffffff'
    },
    {
      title: 'ממוצע חוזקות',
      value: loading ? '-' : animatedValues.averageStrengths,
      icon: TrendingUp,
      trend: '+3.2',
      iconBg: 'var(--color-success-bg)',
      iconColor: 'var(--color-success)',
      cardBg: 'linear-gradient(135deg, #f56565 0%, #fc8181 100%)',
      cardTextColor: '#ffffff'
    },
    {
      title: 'עדכון אחרון',
      value: loading ? '-' : animatedValues.lastUpdated,
      icon: Clock,
      trend: 'עכשיו',
      iconBg: 'var(--color-orange-bg)',
      iconColor: 'var(--color-orange)',
      cardBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cardTextColor: '#ffffff'
    }
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}
      >
        {cardsData.map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'var(--color-gray-200)',
                  borderRadius: 'var(--radius-lg)'
                }}
              />
            </div>
            <div
              style={{
                width: '60%',
                height: '20px',
                backgroundColor: 'var(--color-gray-200)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-2)'
              }}
            />
            <div
              style={{
                width: '40%',
                height: '14px',
                backgroundColor: 'var(--color-gray-200)',
                borderRadius: 'var(--radius-md)'
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)'
      }}
    >
      {cardsData.map((card, index) => (
        <StatCard key={card.title} card={card} index={index} />
      ))}
    </div>
  );
};

// Separate component for individual stat card to avoid hooks in loop
const StatCard = ({ card, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const IconComponent = card.icon;

  return (
    <div
      style={{
        background: card.cardBg,
        border: 'none',
        borderRadius: '12px',
        padding: 'var(--space-6)',
        transition: 'all var(--transition-base)',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 8px 16px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        animation: `fadeInUp ${0.3 + index * 0.1}s ease-out`,
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div
        style={{
          marginBottom: 'var(--space-3)',
          transition: 'all var(--transition-base)',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <IconComponent size={40} color="rgba(255, 255, 255, 0.95)" strokeWidth={2} />
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.85)',
          margin: '0 0 var(--space-2) 0',
          lineHeight: 'var(--leading-tight)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {card.title}
      </p>

      {/* Value */}
      <p
        style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 var(--space-3) 0',
          lineHeight: '1',
          letterSpacing: '-0.02em'
        }}
      >
        {card.value}
      </p>

      {/* Trend Badge */}
      {card.trend && (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: 'var(--text-xs)',
            color: '#ffffff',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {card.trend.startsWith('+') && <span>↑</span>}
          {card.trend}
        </div>
      )}
    </div>
  );
};

// Add keyframe animations
if (typeof document !== 'undefined' && !document.getElementById('stats-animations')) {
  const style = document.createElement('style');
  style.id = 'stats-animations';
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

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);
}

export default StatsCards;
