import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { addGoal, updateGoalProgress } from '../store/slices/goalsSlice';

export default function Goals() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.goals);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Add Goal Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Add Funds Form State
  const [fundAmount, setFundAmount] = useState('');

  const totalTarget = items.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = items.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addGoal({
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline: new Date(deadline).toISOString()
    }));
    setIsAddModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setDeadline('');
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoalId && fundAmount) {
      const goal = items.find(g => g.id === selectedGoalId);
      if (goal) {
        dispatch(updateGoalProgress({
          id: selectedGoalId,
          amount: goal.currentAmount + parseFloat(fundAmount)
        }));
      }
      setIsFundModalOpen(false);
      setFundAmount('');
      setSelectedGoalId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-5 sm:space-y-8 px-1 sm:px-0"
    >
      {/* Header & Overall Progress */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1 sm:mb-2">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Track and manage your financial targets.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FF6B4A] text-white rounded-full text-sm font-bold hover:bg-[#ff5733] transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </button>
      </div>

      {/* Overall Stats Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="col-span-1 md:col-span-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overall Progress</p>
            <div className="flex items-end gap-3 mb-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(totalSaved)}</h2>
              <span className="text-base sm:text-xl font-bold text-gray-400 mb-1.5">/ {formatCurrency(totalTarget)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-500">Total Saved</span>
                <span className="text-[#FF6B4A]">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#FF6B4A] to-orange-400 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-8 md:pt-0 md:pl-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Goals</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{items.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#FF6B4A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatCurrency(Math.max(0, totalTarget - totalSaved))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((goal, i) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;
          
          return (
            <motion.div 
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full relative group"
            >
              {isCompleted && (
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 z-10">
                  <Target className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <Target className={`w-6 h-6 ${isCompleted ? 'text-teal-500' : 'text-gray-400'}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatCurrency(goal.currentAmount)} <span className="text-gray-300 dark:text-gray-600 mx-1">/</span> {formatCurrency(goal.targetAmount)}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={isCompleted ? 'text-teal-600' : 'text-gray-500'}>
                    {isCompleted ? 'Completed' : 'Progress'}
                  </span>
                  <span className={isCompleted ? 'text-teal-600' : 'text-gray-900 dark:text-white'}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (i * 0.1) }}
                    className={`h-full rounded-full ${isCompleted ? 'bg-teal-500' : 'bg-[#FF6B4A]'}`}
                  />
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedGoalId(goal.id);
                    setIsFundModalOpen(true);
                  }}
                  disabled={isCompleted}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    isCompleted 
                      ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-50 dark:bg-orange-900/20 text-[#FF6B4A] hover:bg-orange-100 dark:hover:bg-orange-900/40'
                  }`}
                >
                  {isCompleted ? 'Goal Reached' : 'Add Funds'}
                </button>
              </div>
            </motion.div>
          );
        })}
        
        {/* Empty State / Add New Card */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl sm:rounded-[32px] p-5 sm:p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[320px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-[#FF6B4A] transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Create New Goal</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Set a new financial target</p>
        </button>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] shadow-xl w-full max-w-md p-8 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">New Goal</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Goal Name</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] font-medium"
                    placeholder="e.g., New Car"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="1"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full pl-9 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] font-medium"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] font-medium"
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FF6B4A] text-white rounded-2xl font-bold hover:bg-[#ff5733] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {isFundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsFundModalOpen(false);
                setSelectedGoalId(null);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] shadow-xl w-full max-w-sm p-8 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Add Funds</h3>
                <button 
                  onClick={() => {
                    setIsFundModalOpen(false);
                    setSelectedGoalId(null);
                  }} 
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddFunds} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount to Add</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input 
                      type="number" 
                      required
                      min="0.01"
                      step="0.01"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full pl-9 pr-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] font-medium text-xl"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FF6B4A] text-white rounded-2xl font-bold hover:bg-[#ff5733] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Confirm Addition
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
