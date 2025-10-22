/**
 * Enhanced Analysis Charts Component
 * Real data visualizations with interactive features
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: any;
  darkMode?: boolean;
  height?: number;
}

/**
 * Learning Styles Distribution Chart
 */
export const LearningStylesDistributionChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const styles = data?.learningStyles || {};
    const labels = Object.keys(styles).map(style => {
      // Translate learning style labels
      const translations: Record<string, string> = {
        visual: t('charts.learningStyles.visual'),
        auditory: t('charts.learningStyles.auditory'),
        kinesthetic: t('charts.learningStyles.kinesthetic'),
        'reading/writing': t('charts.learningStyles.readingWriting'),
      };
      return translations[style] || style;
    });

    return {
      labels,
      datasets: [
        {
          label: t('charts.learningStyles.title'),
          data: Object.values(styles),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(147, 51, 234, 0.8)',   // Purple
            'rgba(34, 197, 94, 0.8)',    // Green
            'rgba(251, 146, 60, 0.8)',   // Orange
            'rgba(236, 72, 153, 0.8)',   // Pink
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(147, 51, 234, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(236, 72, 153, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#fff' : '#374151',
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

/**
 * Academic Performance Distribution Chart
 */
export const PerformanceDistributionChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const distribution = data?.performanceDistribution || {};

    return {
      labels: [
        t('charts.performance.excellent'),
        t('charts.performance.good'),
        t('charts.performance.average'),
        t('charts.performance.needsSupport'),
      ],
      datasets: [
        {
          label: t('charts.performance.title'),
          data: [
            distribution.excellent || 0,
            distribution.good || 0,
            distribution.average || 0,
            distribution.needsSupport || 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green - Excellent
            'rgba(59, 130, 246, 0.8)',  // Blue - Good
            'rgba(251, 191, 36, 0.8)',  // Yellow - Average
            'rgba(239, 68, 68, 0.8)',   // Red - Needs Support
          ],
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
        },
      ],
    };
  }, [data, darkMode, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = data?.totalStudents || 1;
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.y} תלמידים (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

/**
 * Emotional Health Chart
 */
export const EmotionalHealthChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const health = data?.emotionalHealth || {};

    return {
      labels: [
        t('charts.emotional.positive'),
        t('charts.emotional.neutral'),
        t('charts.emotional.concerning'),
      ],
      datasets: [
        {
          data: [
            health.positive || 0,
            health.neutral || 0,
            health.concerning || 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green - Positive
            'rgba(156, 163, 175, 0.8)', // Gray - Neutral
            'rgba(239, 68, 68, 0.8)',   // Red - Concerning
          ],
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 2,
        },
      ],
    };
  }, [data, darkMode, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: darkMode ? '#fff' : '#374151',
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

/**
 * Class Performance Comparison Chart
 */
export const ClassPerformanceChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const classPerformance = data?.classPerformance || {};
    const labels = Object.keys(classPerformance);
    const averages = labels.map(cls => classPerformance[cls]?.average || 0);

    return {
      labels,
      datasets: [
        {
          label: t('charts.classPerformance.averageGrade'),
          data: averages,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const className = context.label;
            const performance = data?.classPerformance?.[className];
            return [
              `ממוצע: ${context.parsed.y}`,
              `מגמה: ${performance?.trend || 'stable'}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

/**
 * Performance Trends Chart
 */
export const PerformanceTrendsChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const trends = data?.performanceTrends || {};

    return {
      labels: [
        t('charts.trends.improving'),
        t('charts.trends.stable'),
        t('charts.trends.declining'),
      ],
      datasets: [
        {
          data: [
            trends.improving || 0,
            trends.stable || 0,
            trends.declining || 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green - Improving
            'rgba(59, 130, 246, 0.8)',  // Blue - Stable
            'rgba(239, 68, 68, 0.8)',   // Red - Declining
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#fff' : '#374151',
          padding: 15,
          generateLabels: (chart: any) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label: string, i: number) => ({
              text: `${label}: ${dataset.data[i]}`,
              fillStyle: dataset.backgroundColor[i],
              strokeStyle: dataset.backgroundColor[i],
              lineWidth: 0,
              index: i,
            }));
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <PolarArea data={chartData} options={options} />
    </div>
  );
};

/**
 * Strengths Distribution Chart
 */
export const StrengthsDistributionChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const topStrengths = data?.topStrengths?.slice(0, 8) || [];

    return {
      labels: topStrengths.map((s: any) => s.strength),
      datasets: [
        {
          label: t('charts.strengths.title'),
          data: topStrengths.map((s: any) => s.count),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const strength = data?.topStrengths?.[context.dataIndex];
            return `${strength?.count} תלמידים (${strength?.percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '350px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

/**
 * Risk Distribution Chart
 */
export const RiskDistributionChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const risk = data?.riskDistribution || {};

    return {
      labels: [
        t('charts.risk.low'),
        t('charts.risk.medium'),
        t('charts.risk.high'),
      ],
      datasets: [
        {
          data: [risk.low || 0, risk.medium || 0, risk.high || 0],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',   // Green - Low Risk
            'rgba(251, 191, 36, 0.8)',  // Yellow - Medium Risk
            'rgba(239, 68, 68, 0.8)',   // Red - High Risk
          ],
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 2,
        },
      ],
    };
  }, [data, darkMode, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#fff' : '#374151',
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = data?.totalStudents || 1;
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} תלמידים (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

/**
 * Advanced Metrics Radar Chart
 */
export const AdvancedMetricsChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return {
      labels: [
        t('charts.metrics.engagement'),
        t('charts.metrics.wellbeing'),
        t('charts.metrics.academic'),
        t('charts.metrics.social'),
      ],
      datasets: [
        {
          label: t('charts.metrics.currentLevel'),
          data: [
            data?.engagementScore || 0,
            data?.wellbeingIndex || 0,
            data?.academicReadiness || 0,
            data?.socialIntegration || 0,
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        },
        {
          label: t('charts.metrics.target'),
          data: [80, 80, 80, 80], // Target levels
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.5)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
        },
      ],
    };
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#fff' : '#374151',
          padding: 15,
          font: { size: 12 },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
          backdropColor: 'transparent',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        pointLabels: {
          color: darkMode ? '#fff' : '#374151',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div style={{ height: '350px' }}>
      <Radar data={chartData} options={options} />
    </div>
  );
};

/**
 * Participation Levels Chart
 */
export const ParticipationLevelsChart: React.FC<ChartProps> = ({ data, darkMode }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const participation = data?.participationLevels || {};

    return {
      labels: [
        t('charts.participation.high'),
        t('charts.participation.medium'),
        t('charts.participation.low'),
      ],
      datasets: [
        {
          label: t('charts.participation.title'),
          data: [
            participation.high || 0,
            participation.medium || 0,
            participation.low || 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderRadius: 8,
        },
      ],
    };
  }, [data, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#4B5563',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default {
  LearningStylesDistributionChart,
  PerformanceDistributionChart,
  EmotionalHealthChart,
  ClassPerformanceChart,
  PerformanceTrendsChart,
  StrengthsDistributionChart,
  RiskDistributionChart,
  AdvancedMetricsChart,
  ParticipationLevelsChart,
};