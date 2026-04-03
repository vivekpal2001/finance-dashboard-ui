import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HealthScore() {
  const { items } = useAppSelector((state) => state.transactions);

  const { score, status, color, tips } = useMemo(() => {
    const expenses = items.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const income = items.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    let calculatedScore = 50; // Base score
    let calculatedTips: string[] = [];
    
    if (income > 0) {
      const savingsRate = ((income - expenses) / income) * 100;
      
      if (savingsRate >= 20) {
        calculatedScore = 90 + Math.min(10, (savingsRate - 20));
        calculatedTips = ["Great job! You're saving consistently.", "Consider investing your surplus."];
      } else if (savingsRate >= 10) {
        calculatedScore = 75 + (savingsRate - 10);
        calculatedTips = ["Good savings rate.", "Try to cut back on dining to reach 20%."];
      } else if (savingsRate > 0) {
        calculatedScore = 60 + savingsRate;
        calculatedTips = ["You're saving, but it's low.", "Review your subscriptions and recurring bills."];
      } else {
        calculatedScore = Math.max(10, 50 - (Math.abs(savingsRate) / 2));
        calculatedTips = ["You're spending more than you earn.", "Create a strict budget immediately."];
      }
    } else if (expenses > 0) {
      calculatedScore = 20;
      calculatedTips = ["No income recorded.", "Track your income to get an accurate score."];
    } else {
      calculatedScore = 0;
      calculatedTips = ["Add transactions to see your score."];
    }

    calculatedScore = Math.round(Math.min(100, Math.max(0, calculatedScore)));

    let currentStatus = 'Needs Attention';
    let currentColor = '#EF4444'; // red-500
    
    if (calculatedScore >= 80) {
      currentStatus = 'Excellent';
      currentColor = '#10B981'; // emerald-500
    } else if (calculatedScore >= 60) {
      currentStatus = 'Good';
      currentColor = '#F59E0B'; // amber-500
    }

    return { score: calculatedScore, status: currentStatus, color: currentColor, tips: calculatedTips };
  }, [items]);

  // SVG Gauge calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Financial Health</h3>
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100 dark:text-gray-800"
            />
            {/* Progress Circle */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="70"
              cy="70"
              r={radius}
              stroke={color}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{score}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">/ 100</span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Improvement Tips</p>
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
            {score >= 80 ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : score >= 60 ? (
              <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
