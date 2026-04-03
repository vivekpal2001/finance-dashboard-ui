import React from "react";
import { useAppSelector } from "../../store/hooks";
import { Target, Plus } from "lucide-react";
import { formatCurrency } from "../../lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function GoalTracker() {
  const { items } = useAppSelector((state) => state.goals);

  const topGoal = items.length > 0 ? items[0] : null;
  const progress = topGoal
    ? Math.min((topGoal.currentAmount / topGoal.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col justify-between relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Goal Tracker</h3>
        <Link to="/goals" className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-[#FF6B4A] hover:bg-orange-100 transition-colors">
          <Target className="w-5 h-5" />
        </Link>
      </div>

      {topGoal ? (
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{topGoal.title}</p>
          <div className="flex items-end gap-2 mb-6">
            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(topGoal.currentAmount)}</h3>
            <span className="text-sm font-bold text-gray-400 mb-1">/ {formatCurrency(topGoal.targetAmount)}</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              <span className="uppercase tracking-wider">Progress</span>
              <span className="text-[#FF6B4A]">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#FF6B4A] rounded-full"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">No active goals</p>
          <Link to="/goals" className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B4A] text-white rounded-full text-sm font-bold hover:bg-[#ff5733] transition-colors">
            <Plus className="w-4 h-4" />
            Set a Goal
          </Link>
        </div>
      )}
    </div>
  );
}
