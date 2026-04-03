import React, { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function CategoryChart() {
  const { items } = useAppSelector((state) => state.transactions);
  const theme = useAppSelector((state) => state.ui.theme);

  const COLORS =
    theme === "dark"
      ? ["#f9fafb", "#06b6d4", "#8b5cf6", "#f97316"] // Light gray for first bar in dark mode
      : ["#111827", "#06b6d4", "#8b5cf6", "#f97316"];

  const data = useMemo(() => {
    const expenses = items.filter((t) => t.type === "expense");
    const categoryTotals = expenses.reduce(
      (acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Show top 4
  }, [items]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex items-center justify-center">
        <p className="text-gray-500">No expense data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Spending by Category
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Top 4 expenses
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: theme === "dark" ? "#374151" : "#f3f4f6",
                color: theme === "dark" ? "#f9fafb" : "#111827",
                borderRadius: "0.5rem",
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[20, 20, 20, 20]} 
              barSize={30}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
