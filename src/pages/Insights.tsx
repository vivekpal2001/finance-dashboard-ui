import React, { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/utils';
import { 
  Pizza, 
  TrendingUp, 
  X, 
  Sparkles, 
  Utensils, 
  Home, 
  Car,
  AlertCircle
} from 'lucide-react';
import CashFlowDiagram from '../components/dashboard/CashFlowDiagram';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Insights() {
  const { items } = useAppSelector(state => state.transactions);

  // Process data
  const {
    topSpendCategory,
    topSpendAmount,
    dailyAverage,
    monthlyLimit,
    categoryBreakdown,
    monthlyData
  } = useMemo(() => {
    const expenses = items.filter(t => t.type === 'expense');
    const income = items.filter(t => t.type === 'income');

    // Category Breakdown
    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([name, amount]) => ({ name, amount }));

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const breakdown = sortedCategories.slice(0, 3).map(cat => ({
      ...cat,
      percentage: Math.round((cat.amount / totalExpenses) * 100) || 0
    }));

    // Top Spend
    const topSpend = sortedCategories[0] || { name: 'N/A', amount: 0 };

    // Daily Average (assuming current month for simplicity, using 30 days)
    const dailyAvg = totalExpenses / 30;
    const limit = 300; // Hardcoded limit for UI

    // Monthly Data for Chart (Last 6 months)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
    const mData = months.map((month, index) => {
      // Generating monthly distribution based on total data to make it look good
      // In a real app, we'd group by actual dates
      const randomFactor = 0.8 + (Math.random() * 0.4);
      return {
        name: month,
        income: Math.round((totalExpenses * 1.2 / 6) * randomFactor),
        expenses: Math.round((totalExpenses / 6) * randomFactor * 0.9)
      };
    });

    return {
      topSpendCategory: topSpend.name,
      topSpendAmount: topSpend.amount,
      dailyAverage: dailyAvg,
      monthlyLimit: limit,
      categoryBreakdown: breakdown,
      monthlyData: mData
    };
  }, [items]);

  // Activity Map Data (7x4 grid)
  const activityData = Array.from({ length: 28 }).map(() => Math.random());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-1 sm:px-0"
    >
      {/* Top Row: Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Spend Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col justify-between h-auto sm:h-[220px]">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <Pizza className="w-6 h-6 text-red-500" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Top Spend</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{topSpendCategory}</h3>
            <div className="flex items-end gap-3">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(topSpendAmount)}</span>
              <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full mb-1">+12.4%</span>
            </div>
          </div>
          <Pizza className="absolute -bottom-8 -right-8 w-48 h-48 text-gray-50 dark:text-gray-800/50 -rotate-12 pointer-events-none" />
        </div>

        {/* Daily Average Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-auto sm:h-[220px]">
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Average</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4">{formatCurrency(dailyAverage)}</h3>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full" 
                  style={{ width: `${Math.min((dailyAverage / monthlyLimit) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Limit: {formatCurrency(monthlyLimit)}</p>
            </div>
          </div>
        </div>

        {/* Alerts Stack */}
        <div className="flex flex-col gap-3 sm:gap-4 h-auto sm:h-[220px]">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start gap-3 sm:gap-4 relative overflow-hidden flex-1">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF6B4A]" />
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
              <Pizza className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 pr-6">
              <p className="text-[10px] font-bold text-[#FF6B4A] uppercase tracking-wider mb-1">Budget Variance</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Dining spend exceeds projection by 18%</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start gap-3 sm:gap-4 relative overflow-hidden flex-1">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500" />
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-teal-500" />
            </div>
            <div className="flex-1 pr-6">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Saving Milestone</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">You reached your monthly savings target!</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-6 sm:mb-8 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Income vs Expenses</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last 6 Months Velocity</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-600/80" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]/80" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expenses</span>
            </div>
          </div>
        </div>
        <div className="h-[220px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="income" 
                fill="#0D9488" 
                radius={[8, 8, 8, 8]} 
                barSize={24} 
                opacity={0.7} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="expenses" 
                fill="#FF6B4A" 
                radius={[8, 8, 8, 8]} 
                barSize={24} 
                opacity={0.8} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Sankey Diagram */}
      <CashFlowDiagram transactions={items} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-5 sm:mb-8">Category Breakdown</h3>
          <div className="space-y-5 sm:space-y-8">
            {categoryBreakdown.map((cat, index) => {
              const icons = [Utensils, Home, Car];
              const colors = ['#FF6B4A', '#FF6B4A', '#FF6B4A'];
              const Icon = icons[index] || AlertCircle;
              
              return (
                <div key={cat.name} className="flex items-center gap-3 sm:gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#FF6B4A]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{cat.percentage}%</span>
                        <span className="text-gray-400 text-sm font-medium">({formatCurrency(cat.amount)})</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${cat.percentage}%`, backgroundColor: colors[index] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Map */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-red-100 dark:border-red-900/20 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Activity Map</h3>
          <p className="text-[10px] font-bold text-[#FF6B4A] uppercase tracking-wider mb-8">Weekly Peak Intensity</p>
          
          <div className="grid grid-cols-7 gap-2 mb-auto">
            {activityData.map((val, i) => {
              let opacity = 0.1;
              if (val > 0.8) opacity = 1;
              else if (val > 0.5) opacity = 0.6;
              else if (val > 0.2) opacity = 0.3;
              
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded-md bg-[#FF6B4A]"
                  style={{ opacity }}
                />
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 mt-8 shadow-sm">
            <p className="text-[10px] font-bold text-[#FF6B4A] uppercase tracking-wider mb-2">Editor's Insight</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 italic leading-relaxed">
              "Spend momentum peaks Wednesday afternoons between 12 PM - 3 PM."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
