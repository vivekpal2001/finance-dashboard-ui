import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addTransaction, updateTransaction } from '../../store/slices/transactionsSlice';
import { TransactionType } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

export default function TransactionModal({ isOpen, onClose, transactionId }: TransactionModalProps) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.transactions);
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Smart Categorization
  useEffect(() => {
    if (!transactionId && description.length > 2 && !category) {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || lowerDesc.includes('gas') || lowerDesc.includes('transit')) {
        setCategory('Transport');
      } else if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('restaurant') || lowerDesc.includes('coffee')) {
        setCategory('Food');
      } else if (lowerDesc.includes('movie') || lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('game')) {
        setCategory('Entertainment');
      } else if (lowerDesc.includes('amazon') || lowerDesc.includes('target') || lowerDesc.includes('walmart')) {
        setCategory('Shopping');
      } else if (lowerDesc.includes('salary') || lowerDesc.includes('paycheck')) {
        setType('income');
        setCategory('Salary');
      }
    }
  }, [description, transactionId, category]);

  useEffect(() => {
    if (transactionId) {
      const t = items.find(i => i.id === transactionId);
      if (t) {
        setType(t.type);
        setAmount(t.amount.toString());
        setCategory(t.category);
        setDescription(t.description);
        setDate(t.date.split('T')[0]);
      }
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionId, items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(),
    };

    if (transactionId) {
      dispatch(updateTransaction({ ...payload, id: transactionId }));
    } else {
      dispatch(addTransaction(payload));
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{transactionId ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input 
                type="number" 
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Groceries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input 
                type="text" 
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#FF6B4A] text-white rounded-lg font-medium hover:bg-[#ff5733] transition-colors shadow-sm shadow-orange-500/20"
            >
              {transactionId ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
