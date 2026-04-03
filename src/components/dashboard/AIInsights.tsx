import React, { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../../lib/utils";

export default function AIInsights() {
  const { items } = useAppSelector((state) => state.transactions);

  const { topCategoryName, topCategoryAmount } = useMemo(() => {
    const expenses = items.filter((t) => t.type === "expense");

    const categoryTotals = expenses.reduce(
      (acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      topCategoryName: topCategory ? topCategory[0] : "None",
      topCategoryAmount: topCategory ? topCategory[1] : 0,
    };
  }, [items]);

  return (
    <div className="bg-gradient-to-br from-[#FF6B4A] to-[#ff8c73] rounded-2xl sm:rounded-[32px] p-5 sm:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,50 Q25,20 50,50 T100,50"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M0,60 Q25,30 50,60 T100,60"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M0,70 Q25,40 50,70 T100,70"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-4xl font-bold">
            {formatCurrency(topCategoryAmount)}
          </h3>
          <p className="text-orange-100 text-sm mt-1">
            Highest Spending: {topCategoryName}
          </p>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Brain className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <p className="text-lg font-medium mb-4 leading-tight">
          {topCategoryAmount > 0
            ? `You've spent the most on ${topCategoryName} this month. Consider setting a budget.`
            : "Add some expenses to get personalized insights."}
        </p>
        <button className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
