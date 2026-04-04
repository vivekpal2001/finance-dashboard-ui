import React, { useRef, useState } from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import BalanceChart from '../components/dashboard/BalanceChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import AIInsights from '../components/dashboard/AIInsights';
import HealthScore from '../components/dashboard/HealthScore';
import GoalTracker from '../components/dashboard/GoalTracker';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShareSnapshot = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setIsCapturing(true);
      // Wait a bit for any animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#030712' : '#f9fafb',
        logging: false,
        useCORS: true,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `findash-snapshot-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-1 sm:px-0"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome Back, Vivek!</h2>
        <button
          onClick={handleShareSnapshot}
          disabled={isCapturing}
          className="flex items-center px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-900 dark:text-white"
        >
          {isCapturing ? <Loader2 className="w-4 h-4 mr-1.5 sm:mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-1.5 sm:mr-2" />}
          <span className="hidden sm:inline">Share </span>Snapshot
        </button>
      </div>

      <div ref={dashboardRef} className="space-y-4 sm:space-y-6 p-2 sm:p-4 -m-2 sm:-m-4 rounded-2xl">
        <SummaryCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BalanceChart />
          </div>
          <div>
            <CategoryChart />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HealthScore />
          <GoalTracker />
          <AIInsights />
        </div>
      </div>
    </motion.div>
  );
}
