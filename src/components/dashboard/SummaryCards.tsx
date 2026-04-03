import React, { useMemo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { formatCurrency } from "../../lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  Target,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

const TypingAmountCard = ({ card }: { card: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const formattedAmount = formatCurrency(card.amount);
  const [displayAmount, setDisplayAmount] = useState(formattedAmount);

  React.useEffect(() => {
    if (isHovered) {
      let i = 0;
      setDisplayAmount("");
      const interval = setInterval(() => {
        i++;
        setDisplayAmount(formattedAmount.substring(0, i));
        if (i >= formattedAmount.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayAmount(formattedAmount);
    }
  }, [isHovered, formattedAmount]);

  return (
    <div 
      className="relative w-full h-[130px] sm:h-[160px] cursor-pointer bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
          </div>
          <span className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider">
            {card.title}
          </span>
        </div>
        <Info className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#FF6B4A] transition-colors" />
      </div>
      
      <div className="relative z-10 flex items-end justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white min-h-[28px] sm:min-h-[36px] flex items-center">
          {displayAmount}
          {isHovered && displayAmount.length < formattedAmount.length && (
            <span className="w-1 h-8 bg-[#FF6B4A] ml-1 animate-pulse" />
          )}
        </span>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            card.trendUp
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {card.trendUp ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {card.trend}
        </div>
      </div>
    </div>
  );
};

export default function SummaryCards() {
  const { items } = useAppSelector((state) => state.transactions);
  const { items: goals } = useAppSelector((state) => state.goals);

  const { income, expense, balance } = useMemo(() => {
    return items.reduce(
      (acc, curr) => {
        if (curr.type === "income") {
          acc.income += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.expense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [items]);

  const totalGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const cards = [
    {
      title: "Total Earning",
      amount: income,
      icon: ArrowUpRight,
      iconBg: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500",
      trend: "+3.25%",
      trendUp: true,
      backTitle: "Consistent Growth",
      backDesc: "Your income is up 3.25% compared to the previous 30 days."
    },
    {
      title: "Total Spending",
      amount: expense,
      icon: ArrowDownRight,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-500",
      trend: "-5.82%",
      trendUp: false,
      backTitle: "Spending Optimized",
      backDesc: "You've reduced unnecessary expenses by 5.82% this month."
    },
    {
      title: "Spending Goals",
      amount: totalGoals,
      icon: Target,
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-[#FF6B4A]",
      trend: "+8.23%",
      trendUp: true,
      backTitle: "On Track",
      backDesc: "You are progressing well towards your total savings targets."
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TypingAmountCard card={card} />
        </motion.div>
      ))}
    </div>
  );
}
