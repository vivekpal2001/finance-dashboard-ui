import React, { useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function BalanceChart() {
  const { items } = useAppSelector((state) => state.transactions);
  const theme = useAppSelector((state) => state.ui.theme);

  const { data, totalProfit, totalRevenue } = useMemo(() => {
    const sortedItems = [...items].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let runningBalance = 0;
    let revenue = 0;
    let expense = 0;
    const dailyData = new Map<string, number>();

    sortedItems.forEach((t) => {
      const dateStr = format(parseISO(t.date), "MMM dd");
      if (t.type === "income") {
        runningBalance += t.amount;
        revenue += t.amount;
      } else {
        runningBalance -= t.amount;
        expense += t.amount;
      }
      dailyData.set(dateStr, runningBalance);
    });

    return {
      data: Array.from(dailyData.entries()).map(([date, balance]) => ({
        date,
        balance,
      })),
      totalProfit: revenue - expense,
      totalRevenue: revenue,
    };
  }, [items]);

  const textColor = theme === "dark" ? "#9ca3af" : "#6b7280";
  const gridColor = theme === "dark" ? "#374151" : "#f3f4f6";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-6 sm:gap-8 h-full">
      {/* Left Side Stats */}
      <div className="flex flex-row lg:flex-col justify-between w-full lg:w-48 shrink-0 gap-4 sm:gap-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6 text-gray-900 dark:text-white">
            Monthly Summary
          </h3>

          <div className="space-y-3 sm:space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                Net Savings
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalProfit)}
                </p>
                <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                  {totalProfit >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
                Total Inflow
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Chart */}
      <div className="flex-1 min-h-[250px] sm:min-h-[300px] relative">
        <div className="absolute top-0 right-0 flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full z-10">
          {data.length > 0 ? data[data.length - 1].date : "Today"}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 40, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B4A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF6B4A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: theme === "dark" ? "#374151" : "#f3f4f6",
                color: theme === "dark" ? "#f9fafb" : "#111827",
                borderRadius: "0.5rem",
              }}
            />
            <Area
              type="step"
              dataKey="balance"
              stroke="#FF6B4A"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBalance)"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
