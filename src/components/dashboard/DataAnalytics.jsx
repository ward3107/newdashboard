import React, { useState } from 'react';
import { BarChart3, Table as TableIcon, PieChart as PieChartIcon, TrendingUp, Award, Target, Brain, Users } from 'lucide-react';
import Table from '../ui/Table';

/**
 * DataAnalytics Component - Multiple data perspectives and visualizations
 */

const DataAnalytics = ({ students, stats }) => {
  const [activeView, setActiveView] = useState('overview');

  // Prepare table data
  const tableColumns = [
    {
      key: 'name',
      label: 'שם תלמיד',
      render: (value) => (
        <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>
          {value}
        </span>
      )
    },
    {
      key: 'classId',
      label: 'כיתה',
      render: (value) => (
        <span style={{
          padding: 'var(--space-1) var(--space-3)',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-700)',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'strengthsCount',
      label: 'חוזקות',
      render: (value) => (
        <span style={{
          padding: 'var(--space-1) var(--space-2)',
          backgroundColor: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-bold)'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'challengesCount',
      label: 'אתגרים',
      render: (value) => (
        <span style={{
          padding: 'var(--space-1) var(--space-2)',
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-bold)'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'learningStyle',
      label: 'סגנון למידה',
      render: (value) => {
        const styles = value?.split('\n').filter(s => s.trim());
        const firstStyle = styles?.[0]?.replace(/^• /, '').replace(/^[^\s]+ /, '').trim() || '-';
        return (
          <span style={{
            color: 'var(--color-gray-600)',
            fontSize: 'var(--text-xs)'
          }}>
            {firstStyle}
          </span>
        );
      }
    },
    {
      key: 'date',
      label: 'תאריך',
      render: (value) => (
        <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-xs)' }}>
          {value}
        </span>
      )
    }
  ];

  // Calculate insights
  const insights = {
    topPerformers: [...students]
      .sort((a, b) => b.strengthsCount - a.strengthsCount)
      .slice(0, 5),
    needsAttention: [...students]
      .sort((a, b) => b.challengesCount - a.challengesCount)
      .slice(0, 5),
    byClass: stats?.byClass || {},
    avgStrengthsPerClass: Object.entries(stats?.byClass || {}).map(([className, count]) => {
      const classStudents = students.filter(s => s.classId === className);
      const avgStrengths = classStudents.reduce((sum, s) => sum + s.strengthsCount, 0) / classStudents.length;
      return { className, avgStrengths: avgStrengths.toFixed(1), count };
    })
  };

  const viewButtons = [
    { id: 'overview', label: 'סקירה כללית', icon: BarChart3 },
    { id: 'table', label: 'טבלה', icon: TableIcon },
    { id: 'insights', label: 'תובנות', icon: Brain }
  ];

  return (
    <div style={{ marginBottom: 'var(--space-8)' }}>
      {/* View Selector */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: 'var(--space-3)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-gray-200)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {viewButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeView === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveView(btn.id)}
              style={{
                flex: 1,
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: isActive ? 'var(--color-primary-600)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-gray-700)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <Icon size={18} />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {/* Class Performance Cards */}
          {insights.avgStrengthsPerClass.map((item, index) => {
            const colors = [
              { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#fff' },
              { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#fff' }
            ];
            const color = colors[index % colors.length];

            return (
              <div
                key={item.className}
                style={{
                  background: color.bg,
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  color: color.text,
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-bold)',
                        margin: 0
                      }}>
                        {item.className}
                      </h3>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        margin: 0,
                        opacity: 0.9
                      }}>
                        {item.count} תלמידים
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        margin: '0 0 var(--space-1) 0',
                        opacity: 0.9
                      }}>
                        ממוצע חוזקות
                      </p>
                      <p style={{
                        fontSize: 'var(--text-4xl)',
                        fontWeight: 'var(--font-bold)',
                        margin: 0,
                        lineHeight: 1
                      }}>
                        {item.avgStrengths}
                      </p>
                    </div>
                    <Award size={32} style={{ opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {activeView === 'table' && (
        <Table data={students} columns={tableColumns} />
      )}

      {/* Insights View */}
      {activeView === 'insights' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {/* Top Performers */}
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            border: '1px solid var(--color-gray-200)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '2px solid var(--color-success-light)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={24} color="#fff" />
              </div>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-gray-900)',
                margin: 0
              }}>
                מצטיינים
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {insights.topPerformers.map((student, index) => (
                <div
                  key={student.studentCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    backgroundColor: index === 0 ? 'var(--color-success-bg)' : 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: index === 0 ? '2px solid var(--color-success)' : '1px solid var(--color-gray-200)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      background: index === 0 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'var(--color-gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--font-bold)',
                      fontSize: 'var(--text-sm)',
                      color: '#fff'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-gray-900)',
                        margin: 0,
                        fontSize: 'var(--text-sm)'
                      }}>
                        תלמיד {student.studentCode}
                      </p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-gray-500)',
                        margin: 0
                      }}>
                        {student.classId}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--color-success)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'var(--font-bold)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {student.strengthsCount} חוזקות
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            border: '1px solid var(--color-gray-200)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '2px solid var(--color-warning-light)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Target size={24} color="#fff" />
              </div>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-gray-900)',
                margin: 0
              }}>
                דורשים תשומת לב
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {insights.needsAttention.map((student, index) => (
                <div
                  key={student.studentCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    backgroundColor: index === 0 ? 'var(--color-warning-bg)' : 'var(--color-gray-50)',
                    borderRadius: 'var(--radius-lg)',
                    border: index === 0 ? '2px solid var(--color-warning)' : '1px solid var(--color-gray-200)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      background: index === 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'var(--color-gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--font-bold)',
                      fontSize: 'var(--text-sm)',
                      color: '#fff'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--color-gray-900)',
                        margin: 0,
                        fontSize: 'var(--text-sm)'
                      }}>
                        תלמיד {student.studentCode}
                      </p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-gray-500)',
                        margin: 0
                      }}>
                        {student.classId}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--color-warning)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'var(--font-bold)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {student.challengesCount} אתגרים
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalytics;
