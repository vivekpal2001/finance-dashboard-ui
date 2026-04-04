import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';

interface CashFlowNode {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CashFlowProps {
  transactions: Transaction[];
}

export default function CashFlowDiagram({ transactions }: CashFlowProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { totalIncome, totalExpenses, totalSavings, categories } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalInc = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);
    const savings = Math.max(totalInc - totalExp, 0);

    // Category breakdown
    const categoryTotals = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#FF6B4A', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899'];
    const sortedCategories: CashFlowNode[] = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, amount], i) => ({
        name,
        amount,
        color: colors[i % colors.length],
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      }));

    return { totalIncome: totalInc, totalExpenses: totalExp, totalSavings: savings, categories: sortedCategories };
  }, [transactions]);

  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 80;
  const savingsPercentage = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 20;

  // Generate flow path data for reuse (path d + id)
  const incomeToExpensePath = `M 70 ${10 + (280 * (1 - expensePercentage / 100) / 2)} C 200 ${10 + (280 * (1 - expensePercentage / 100) / 2)}, 200 20, 330 20`;

  const savingsPathY = 290 - (280 * savingsPercentage / 100);
  const incomeToSavingsPath = `M 70 ${290 - (280 * savingsPercentage / 100) / 2} C 200 ${290 - (280 * savingsPercentage / 100) / 2}, 200 ${savingsPathY}, 330 ${savingsPathY}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Cash Flow</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Where your money goes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Savings</span>
          </div>
        </div>
      </div>

      {/* Sankey-style Flow Visualization */}
      <div className="relative h-[300px] sm:h-[350px]">
        <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Gradients for flow paths */}
            <linearGradient id="income-to-expense" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="income-to-savings" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.3" />
            </linearGradient>
            {categories.map((cat, i) => (
              <linearGradient key={`expense-to-${cat.name}`} id={`expense-to-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.3" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0.4" />
              </linearGradient>
            ))}

            {/* Flowing particle gradients */}
            <radialGradient id="particle-green">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="particle-orange">
              <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="particle-teal">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
            </radialGradient>

            {/* Wave filter for glow */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Named paths for particle motion */}
            <path id="flow-income-expense" d={incomeToExpensePath} />
            {totalSavings > 0 && <path id="flow-income-savings" d={incomeToSavingsPath} />}
            {categories.map((cat, i) => {
              const barHeight = Math.max((280 * (cat.percentage / 100)), 16);
              const spacing = 280 / categories.length;
              const barY = 20 + i * spacing + (spacing - barHeight) / 2;
              const expenseBarBottom = 20 + 280 * (expensePercentage / 100);
              const startY = 20 + (expenseBarBottom - 20) * ((i + 0.5) / categories.length);
              return (
                <path
                  key={`catpath-${i}`}
                  id={`flow-expense-cat-${i}`}
                  d={`M 390 ${startY} C 520 ${startY}, 520 ${barY + barHeight / 2}, 600 ${barY + barHeight / 2}`}
                />
              );
            })}
          </defs>

          {/* INCOME BAR (Left) */}
          <motion.rect
            x="10" y="10" width="60" rx="8"
            initial={{ height: 0 }}
            animate={{ height: 280 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            fill="#10B981"
            opacity={hoveredNode === null || hoveredNode === 'income' ? 1 : 0.3}
            onMouseEnter={() => setHoveredNode('income')}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          />
          <text x="40" y="155" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" className="pointer-events-none">
            <tspan x="40" dy="-8">₹{Math.round(totalIncome / 1000)}K</tspan>
            <tspan x="40" dy="16" fontSize="8" opacity="0.8">INCOME</tspan>
          </text>

          {/* Flow: Income → Expenses */}
          <motion.path
            d={incomeToExpensePath}
            fill="none"
            stroke="url(#income-to-expense)"
            strokeWidth={280 * (expensePercentage / 100)}
            strokeOpacity={0.15}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />

          {/* Animated wave particles: Income → Expenses */}
          {[0, 1, 2, 3, 4].map(idx => (
            <circle key={`ie-${idx}`} r="5" fill="url(#particle-green)" filter="url(#glow)" opacity="0.8">
              <animateMotion
                dur={`${2.5 + idx * 0.3}s`}
                repeatCount="indefinite"
                begin={`${idx * 0.5}s`}
              >
                <mpath href="#flow-income-expense" />
              </animateMotion>
              <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" begin={`${idx * 0.4}s`} />
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.5s" repeatCount="indefinite" begin={`${idx * 0.4}s`} />
            </circle>
          ))}

          {/* Flow: Income → Savings */}
          {totalSavings > 0 && (
            <>
              <motion.path
                d={incomeToSavingsPath}
                fill="none"
                stroke="url(#income-to-savings)"
                strokeWidth={Math.max(280 * (savingsPercentage / 100), 8)}
                strokeOpacity={0.15}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
              {/* Wave particles: Income → Savings */}
              {[0, 1, 2].map(idx => (
                <circle key={`is-${idx}`} r="4" fill="url(#particle-teal)" filter="url(#glow)" opacity="0.7">
                  <animateMotion
                    dur={`${3 + idx * 0.4}s`}
                    repeatCount="indefinite"
                    begin={`${idx * 0.8}s`}
                  >
                    <mpath href="#flow-income-savings" />
                  </animateMotion>
                  <animate attributeName="r" values="2;5;2" dur="1.8s" repeatCount="indefinite" begin={`${idx * 0.5}s`} />
                  <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.8s" repeatCount="indefinite" begin={`${idx * 0.5}s`} />
                </circle>
              ))}
            </>
          )}

          {/* EXPENSES BAR (Center) */}
          <motion.rect
            x="330" y="20" width="60" rx="8"
            initial={{ height: 0 }}
            animate={{ height: 280 * (expensePercentage / 100) }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            fill="#FF6B4A"
            opacity={hoveredNode === null || hoveredNode === 'expenses' ? 1 : 0.3}
            onMouseEnter={() => setHoveredNode('expenses')}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          />
          <text x="360" y={20 + (280 * expensePercentage / 100) / 2} textAnchor="middle" fill="white" fontSize="11" fontWeight="800" className="pointer-events-none">
            <tspan x="360" dy="-8">₹{Math.round(totalExpenses / 1000)}K</tspan>
            <tspan x="360" dy="16" fontSize="8" opacity="0.8">EXPENSE</tspan>
          </text>

          {/* SAVINGS BAR (Center-bottom) */}
          {totalSavings > 0 && (
            <>
              <motion.rect
                x="330" rx="8"
                y={290 - Math.max(280 * (savingsPercentage / 100), 30)}
                width="60"
                initial={{ height: 0 }}
                animate={{ height: Math.max(280 * (savingsPercentage / 100), 30) }}
                transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                fill="#0D9488"
                opacity={hoveredNode === null || hoveredNode === 'savings' ? 1 : 0.3}
                onMouseEnter={() => setHoveredNode('savings')}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              />
              <text x="360" y={290 - Math.max(280 * (savingsPercentage / 100), 30) / 2} textAnchor="middle" fill="white" fontSize="11" fontWeight="800" className="pointer-events-none">
                <tspan x="360" dy="-8">₹{Math.round(totalSavings / 1000)}K</tspan>
                <tspan x="360" dy="16" fontSize="8" opacity="0.8">SAVED</tspan>
              </text>
            </>
          )}

          {/* Flow: Expenses → Categories & Category Bars (Right) */}
          {categories.map((cat, i) => {
            const barHeight = Math.max((280 * (cat.percentage / 100)), 16);
            const spacing = 280 / categories.length;
            const barY = 20 + i * spacing + (spacing - barHeight) / 2;
            const expenseBarBottom = 20 + 280 * (expensePercentage / 100);
            const startY = 20 + (expenseBarBottom - 20) * ((i + 0.5) / categories.length);

            return (
              <g key={cat.name}>
                {/* Flow path */}
                <motion.path
                  d={`M 390 ${startY} C 520 ${startY}, 520 ${barY + barHeight / 2}, 600 ${barY + barHeight / 2}`}
                  fill="none"
                  stroke={`url(#expense-to-${i})`}
                  strokeWidth={Math.max(barHeight * 0.7, 4)}
                  strokeOpacity={hoveredNode === cat.name ? 0.4 : 0.12}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                />

                {/* Wave particles for each category flow */}
                {[0, 1].map(idx => (
                  <circle key={`cat-${i}-${idx}`} r="3" fill={cat.color} filter="url(#glow)" opacity="0.7">
                    <animateMotion
                      dur={`${2 + idx * 0.5}s`}
                      repeatCount="indefinite"
                      begin={`${1.5 + i * 0.3 + idx * 0.8}s`}
                    >
                      <mpath href={`#flow-expense-cat-${i}`} />
                    </animateMotion>
                    <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" begin={`${idx * 0.3}s`} />
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" repeatCount="indefinite" begin={`${idx * 0.3}s`} />
                  </circle>
                ))}

                {/* Category bar */}
                <motion.rect
                  x="600" y={barY} width="40" rx="6"
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ duration: 0.6, delay: 1 + i * 0.1, ease: 'easeOut' }}
                  fill={cat.color}
                  opacity={hoveredNode === null || hoveredNode === cat.name ? 1 : 0.3}
                  onMouseEnter={() => setHoveredNode(cat.name)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                />

                {/* Category label */}
                <text
                  x="655" y={barY + barHeight / 2 + 1}
                  dominantBaseline="middle"
                  fill={hoveredNode === cat.name ? '#1F2937' : '#9CA3AF'}
                  fontSize="10"
                  fontWeight="700"
                  className="pointer-events-none transition-colors"
                >
                  {cat.name}
                </text>

                {/* Amount label */}
                <text
                  x="655" y={barY + barHeight / 2 + 14}
                  dominantBaseline="middle"
                  fill="#9CA3AF"
                  fontSize="8"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  ₹{Math.round(cat.amount).toLocaleString()} ({cat.percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className={`text-center p-3 rounded-xl transition-colors ${
          hoveredNode === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Income</p>
          <p className="text-lg font-extrabold text-emerald-500 mt-1">{formatCurrency(totalIncome)}</p>
        </div>
        <div className={`text-center p-3 rounded-xl transition-colors ${
          hoveredNode === 'expenses' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Expenses</p>
          <p className="text-lg font-extrabold text-red-500 mt-1">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={`text-center p-3 rounded-xl transition-colors ${
          hoveredNode === 'savings' ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Savings</p>
          <p className="text-lg font-extrabold text-teal-500 mt-1">{formatCurrency(totalSavings)}</p>
        </div>
      </div>
    </div>
  );
}
