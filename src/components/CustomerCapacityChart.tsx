import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerCapacityChart: React.FC = () => {
  const data = {
    labels: ['Customers per Week'],
    datasets: [
      {
        label: 'Without App',
        data: [20],
        backgroundColor: '#9CA3AF',
        borderColor: '#6B7280',
        borderWidth: 1,
      },
      {
        label: 'With App',
        data: [35],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} customers/week`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40,
        ticks: {
          stepSize: 5,
          font: {
            family: 'Inter',
            size: 12,
          },
        },
        grid: {
          color: '#F3F4F6',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Inter',
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Save Time and Serve More Customers</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
      <p className="chart-description">
        With our app, hair stylists save time otherwise spent on appointment booking calls, 
        allowing them to serve more customers each week.
      </p>
    </div>
  );
};

export default CustomerCapacityChart;