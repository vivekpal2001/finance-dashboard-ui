import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTransaction } from '../store/slices/transactionsSlice';
import { formatCurrency } from '../lib/utils';

// Category keyword mapping
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'zomato', 'swiggy', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'biryani', 'chai', 'tea', 'snack', 'grocery', 'groceries', 'eat', 'ate', 'meal', 'dine', 'dhaba'],
  Transport: ['uber', 'ola', 'rapido', 'auto', 'cab', 'taxi', 'metro', 'bus', 'train', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'ride', 'flight', 'travel'],
  Entertainment: ['movie', 'netflix', 'spotify', 'hotstar', 'prime', 'game', 'gaming', 'pvr', 'cinema', 'concert', 'party', 'club', 'fun', 'outing'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'clothes', 'shoes', 'dress', 'shop', 'bought', 'purchase', 'mall', 'croma', 'electronics', 'gadget', 'phone'],
  Bills: ['electricity', 'electric', 'water', 'wifi', 'internet', 'airtel', 'jio', 'recharge', 'bill', 'rent', 'emi', 'insurance', 'gym', 'subscription', 'pharmacy', 'medicine', 'doctor', 'hospital'],
  Salary: ['salary', 'paycheck', 'stipend', 'wage'],
  Freelance: ['freelance', 'client', 'project', 'gig', 'contract', 'consulting'],
  Investments: ['investment', 'mutual fund', 'stock', 'sip', 'dividend', 'interest', 'return', 'fd', 'deposit'],
};

// Date keyword mapping
const DATE_KEYWORDS: Record<string, () => Date> = {
  'today': () => new Date(),
  'yesterday': () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; },
  'day before': () => { const d = new Date(); d.setDate(d.getDate() - 2); return d; },
  'last week': () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; },
  'monday': () => getLastDayOfWeek(1),
  'tuesday': () => getLastDayOfWeek(2),
  'wednesday': () => getLastDayOfWeek(3),
  'thursday': () => getLastDayOfWeek(4),
  'friday': () => getLastDayOfWeek(5),
  'saturday': () => getLastDayOfWeek(6),
  'sunday': () => getLastDayOfWeek(0),
};

function getLastDayOfWeek(day: number): Date {
  const d = new Date();
  const diff = ((d.getDay() - day) + 7) % 7 || 7;
  d.setDate(d.getDate() - diff);
  return d;
}

interface ParsedTransaction {
  amount: number | null;
  type: 'income' | 'expense';
  category: string | null;
  description: string;
  date: Date;
}

function parseNaturalLanguage(input: string): ParsedTransaction {
  const lower = input.toLowerCase().trim();
  
  // Detect type
  const incomePatterns = ['got', 'received', 'earned', 'salary', 'income', 'credited', 'freelance', 'paid me', 'refund'];
  const isIncome = incomePatterns.some(p => lower.includes(p));
  const type = isIncome ? 'income' : 'expense';

  // Extract amount (supports ₹, rs, Rs, numbers)
  const amountMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
  
  // Detect category
  let category: string | null = null;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      category = cat;
      break;
    }
  }

  // Detect date
  let date = new Date();
  for (const [keyword, getDate] of Object.entries(DATE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      date = getDate();
      break;
    }
  }

  // Build description from input — clean up amount and common filler words
  let description = input
    .replace(/(?:₹|rs\.?|inr)?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/gi, '')
    .replace(/\b(spent|paid|got|received|earned|on|for|at|in|to|the|a|an|from|today|yesterday|last week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|day before)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (description) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  } else {
    description = category || (isIncome ? 'Income' : 'Expense');
  }

  return { amount, type, category, description, date };
}

// Example prompts that cycle
const EXAMPLES = [
  'Spent 500 on Zomato yesterday',
  'Got 50000 salary today',
  'Paid 200 for Uber ride',
  'Amazon shopping 1500',
  'Received 3000 freelance payment',
  'Coffee 120 at Cafe Coffee Day',
  'Netflix subscription 199',
  'Grocery shopping 800 yesterday',
];

export default function QuickAdd() {
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.ui.role);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder examples
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parse on input change
  useEffect(() => {
    if (input.trim().length > 2) {
      setParsed(parseNaturalLanguage(input));
    } else {
      setParsed(null);
    }
  }, [input]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!parsed || !parsed.amount) return;
    
    dispatch(addTransaction({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category || (parsed.type === 'income' ? 'Income' : 'Other'),
      description: parsed.description,
      date: parsed.date.toISOString(),
    }));

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setInput('');
      setParsed(null);
      setIsOpen(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && parsed?.amount) {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setInput('');
      setParsed(null);
    }
  };

  if (role !== 'admin') return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full text-xs sm:text-sm font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 group"
      >
        <Zap className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        <span>Quick Add</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => { setIsOpen(false); setInput(''); setParsed(null); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-[90vw] max-w-lg z-50"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Input Row */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={EXAMPLES[placeholderIndex]}
                    className="flex-1 text-base font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => { setIsOpen(false); setInput(''); setParsed(null); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Preview */}
                <AnimatePresence mode="wait">
                  {showSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Check className="w-7 h-7 text-emerald-500" />
                      </div>
                      <p className="text-sm font-bold text-emerald-600">Transaction Added!</p>
                    </motion.div>
                  ) : parsed?.amount ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        Parsed Result
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            parsed.type === 'income'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                          }`}>
                            {parsed.type}
                          </div>
                          {parsed.category && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500">
                              {parsed.category}
                            </span>
                          )}
                        </div>
                        <span className={`text-xl font-extrabold ${
                          parsed.type === 'income' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'
                        }`}>
                          {parsed.type === 'income' ? '+' : '-'}{formatCurrency(parsed.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">{parsed.description}</span>
                        <span className="text-gray-400 text-xs font-medium">
                          {parsed.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-violet-600 hover:to-purple-700 transition-all shadow-md shadow-purple-500/20 mt-2"
                      >
                        Add Transaction
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="help"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4"
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Try saying</p>
                      <div className="grid grid-cols-2 gap-2">
                        {EXAMPLES.slice(0, 4).map((ex, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(ex)}
                            className="text-left text-xs font-medium text-gray-400 hover:text-violet-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 transition-colors truncate"
                          >
                            "{ex}"
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-3 text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold">Enter</kbd> to submit · <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold">Esc</kbd> to close
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
