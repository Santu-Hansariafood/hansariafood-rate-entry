"use client";

import React, { useState, useEffect, Suspense } from 'react';
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
import { motion } from 'framer-motion';
import { TrendingUp, FileText, CheckCircle, BarChart3, BrainCircuit, ArrowLeft, History, MapPin } from 'lucide-react';
import Loading from '@/components/common/Loading/Loading';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('7days');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/analytics/weekly-summary?period=${period}`);
        if (response.data.success) {
          const weeklyData = response.data.data;
          setData(weeklyData);

          const aiResponse = await axiosInstance.post('/analytics/ai-summary', { 
            weeklyData,
            period 
          });
          if (aiResponse.data.success) {
            setAiAnalysis(aiResponse.data.analysis);
          }
        } else {
          setError('Failed to fetch analytics data');
        }
      } catch (err) {
        setError('An error occurred while fetching analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const chartData = {
    labels: data?.dailyData?.map(d => d.displayDate) || [],
    datasets: [
      {
        label: 'Rate Entries',
        data: data?.dailyData?.map(d => d.rateEntries) || [],
        backgroundColor: '#10B981', // Solid Green
        borderRadius: 4,
      },
      {
        label: 'Sauda Tons',
        data: data?.dailyData?.map(d => d.totalTons) || [],
        backgroundColor: '#F59E0B', // Solid Yellow
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          font: { weight: '600' }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: 'rgb(156, 163, 175)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgb(156, 163, 175)' }
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="text-emerald-500" size={32} />
                Performance Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Weekly summary of rate submissions and closed saudas
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              {['7days', '14days', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === p
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {p === '7days' ? 'Last 7 Days' : p === '14days' ? 'Last 14 Days' : 'Month Wise'}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center">
              <span className="text-sm font-medium text-gray-500 mr-2">Status: </span>
              <span className="text-sm font-bold text-emerald-600 uppercase">{period.replace('days', ' Days')}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Rate Entries" 
            value={data?.summary?.totalRateEntries} 
            icon={<FileText className="text-emerald-500" />} 
            color="emerald"
          />
          <StatCard 
            title="Total Sauda Tons" 
            value={`${data?.summary?.totalTonsDone} T`} 
            icon={<CheckCircle className="text-amber-500" />} 
            color="amber"
          />
          <StatCard 
            title="Avg. Daily Tons" 
            value={data?.dailyData?.length > 0 ? (data?.summary?.totalTonsDone / data?.dailyData?.length).toFixed(1) : 0} 
            icon={<TrendingUp className="text-purple-500" />} 
            color="purple"
          />
        </div>

        {/* Chart & AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              Weekly Activity Mapping
            </h3>
            <div className="h-[400px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/5 dark:to-blue-500/5 p-6 rounded-3xl shadow-xl border border-emerald-200/50 dark:border-emerald-800/30 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <BrainCircuit className="text-emerald-500" />
              AI Insights
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnalysis || "Analyzing current week data..."}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Works Done */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <History className="text-indigo-500" size={20} />
            Recent Works Done
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.worksDone?.map((work, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    {work.type}
                  </span>
                  <span className="text-[10px] text-gray-400">{new Date(work.timestamp).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white truncate">{work.company}</h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} /> {work.unit}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{work.tons} Tons</span>
                  </div>
                </div>
                <p className="text-[10px] mt-2 text-gray-400 italic">Commodity: {work.commodity}</p>
              </div>
            ))}
            {(!data?.worksDone || data.worksDone.length === 0) && (
              <p className="text-sm text-gray-500 italic col-span-full py-8 text-center">No recent works recorded.</p>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-between"
  >
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</h2>
    </div>
    <div className={`p-4 rounded-2xl bg-${color}-500/10`}>
      {icon}
    </div>
  </motion.div>
);

export default AnalyticsDashboard;
