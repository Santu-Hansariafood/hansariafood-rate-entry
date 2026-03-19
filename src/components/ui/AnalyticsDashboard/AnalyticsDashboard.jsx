import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance/axiosInstance';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weeklyDataResponse = await axiosInstance.get('/analytics/weekly-summary');
        if (weeklyDataResponse.data.success) {
          const data = weeklyDataResponse.data.data;
          setWeeklyData(data);

          const aiSummaryResponse = await axiosInstance.post('/analytics/ai-summary', { weeklyData: data });
          if (aiSummaryResponse.data.success) {
            setAiAnalysis(aiSummaryResponse.data.analysis);
          } else {
            setError('Failed to fetch AI summary');
          }
        } else {
          setError('Failed to fetch weekly summary');
        }
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ['Weekly Data'],
    datasets: [
      {
        label: 'Rate Entries',
        data: [weeklyData?.rateEntries],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Saudas Done',
        data: [weeklyData?.saudasDone],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <p>Weekly Rate Entry vs. Sauda Done</p>
      <Bar data={chartData} />
      <h2>AI Analysis</h2>
      <p>{aiAnalysis}</p>
    </div>
  );
};

export default AnalyticsDashboard;
