import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ArrowUpRight } from 'lucide-react';

export default function RecentTransactions() {
  const { items } = useAppSelector(state => state.transactions);
  
  const recentItems = items.slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Last Transactions</h3>
        <button className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {recentItems.map((t, i) => (
          <div key={t.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order Successful</p>
              </div>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(t.amount)}
            </span>
          </div>
        ))}
        {recentItems.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No recent transactions.</p>
        )}
      </div>
    </div>
  );
}
