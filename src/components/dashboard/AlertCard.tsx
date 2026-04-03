import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AlertCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Submit Payment Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Receive payment documents and distributions promptly and efficiently.
        </p>
      </div>
    </div>
  );
}
