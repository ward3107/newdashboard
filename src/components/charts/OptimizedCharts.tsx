/**
 * Optimized Chart Components using Chart.js
 * Replacement for Recharts to save ~200KB bundle size
 */

import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options for better performance
const defaultOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300
  },
  plugins: {
    legend: {
      position: 'top' as const,
      rtl: true,
      labels: {
        font: {
          family: 'Inter, Assistant, sans-serif'
        }
      }
    },
    tooltip: {
      rtl: true,
      bodyFont: {
        family: 'Inter, Assistant, sans-serif'
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter, Assistant, sans-serif'
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: 'Inter, Assistant, sans-serif'
        }
      }
    }
  }
};

interface OptimizedLineChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
      fill?: boolean;
    }>;
  };
  options?: ChartOptions<'line'>;
  height?: number;
}

export const OptimizedLineChart: React.FC<OptimizedLineChartProps> = ({
  data,
  options = {},
  height = 300
}) => {
  const chartOptions: ChartOptions<'line'> = {
    ...defaultOptions,
    ...options,
    scales: {
      ...defaultOptions.scales,
      ...options.scales
    }
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
};

interface OptimizedBarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<'bar'>;
  height?: number;
  stacked?: boolean;
}

export const OptimizedBarChart: React.FC<OptimizedBarChartProps> = ({
  data,
  options = {},
  height = 300,
  stacked = false
}) => {
  const chartOptions: ChartOptions<'bar'> = {
    ...defaultOptions,
    ...options,
    scales: {
      ...defaultOptions.scales,
      x: {
        ...defaultOptions.scales?.x,
        stacked,
        ...options.scales?.x
      },
      y: {
        ...defaultOptions.scales?.y,
        stacked,
        ...options.scales?.y
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

interface OptimizedPieChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor?: string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<'pie'>;
  height?: number;
}

export const OptimizedPieChart: React.FC<OptimizedPieChartProps> = ({
  data,
  options = {},
  height = 300
}) => {
  const chartOptions: ChartOptions<'pie'> = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        ...defaultOptions.plugins?.legend,
        position: 'right' as const,
        ...options.plugins?.legend
      }
    }
  };

  return (
    <div style={{ height }}>
      <Pie data={data} options={chartOptions} />
    </div>
  );
};

interface OptimizedDoughnutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor?: string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: ChartOptions<'doughnut'>;
  height?: number;
}

export const OptimizedDoughnutChart: React.FC<OptimizedDoughnutChartProps> = ({
  data,
  options = {},
  height = 300
}) => {
  const chartOptions: ChartOptions<'doughnut'> = {
    ...defaultOptions,
    ...options,
    cutout: '60%',
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        ...defaultOptions.plugins?.legend,
        position: 'right' as const,
        ...options.plugins?.legend
      }
    }
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={chartOptions} />
    </div>
  );
};

/**
 * Sparkline Chart - Minimal line chart for inline display
 */
interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = '#3b82f6',
  height = 50,
  width = 100
}) => {
  const chartData = {
    labels: data.map((_, i) => i.toString()),
    datasets: [{
      data,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: false
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    animation: false
  };

  return (
    <div style={{ height, width }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

/**
 * Progress Chart - Circular progress indicator
 */
interface ProgressChartProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  value,
  max = 100,
  label,
  color = '#10b981',
  size = 100
}) => {
  const percentage = (value / max) * 100;
  const remaining = 100 - percentage;

  const data = {
    datasets: [{
      data: [percentage, remaining],
      backgroundColor: [color, '#e5e7eb'],
      borderWidth: 0
    }]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    animation: {
      duration: 500
    }
  };

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontSize: size * 0.2,
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        {Math.round(percentage)}%
        {label && (
          <div style={{ fontSize: size * 0.1, fontWeight: 'normal', color: '#6b7280' }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Helper function to convert Recharts data to Chart.js format
 */
export function convertRechartsData(
  rechartsData: any[],
  dataKeys: string[],
  colors: string[] = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
): ChartData<'line' | 'bar'> {
  const labels = rechartsData.map(item => item.name || item.label || '');
  const datasets = dataKeys.map((key, index) => ({
    label: key,
    data: rechartsData.map(item => item[key] || 0),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + '20',
    tension: 0.4
  }));

  return { labels, datasets };
}

/**
 * Default color palette
 */
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280'
};

export default {
  OptimizedLineChart,
  OptimizedBarChart,
  OptimizedPieChart,
  OptimizedDoughnutChart,
  SparklineChart,
  ProgressChart,
  convertRechartsData,
  CHART_COLORS
};