import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { deleteTransaction, setSearchQuery, setFilterType, setSort } from '../store/slices/transactionsSlice';
import { formatCurrency } from '../lib/utils';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronDown, 
  Calendar,
  Banknote,
  ShoppingCart,
  Utensils,
  Dumbbell,
  Briefcase,
  FileText,
  Car,
  Film,
  Activity,
  Download,
  List,
  Map,
  Loader2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionModal from '../components/transactions/TransactionModal';

// Lazy-load the map view to avoid loading Leaflet upfront
const TransactionMapView = lazy(() => import('../components/transactions/TransactionMapView'));

const getCategoryStyles = (category: string) => {
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes('food') || lowerCat.includes('dining')) {
    return {
      icon: Utensils,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-500',
      badgeBg: 'bg-orange-50 dark:bg-orange-900/20',
      badgeText: 'text-orange-600 dark:text-orange-400',
    };
  }
  if (lowerCat.includes('transport')) {
    return {
      icon: Car,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-500',
      badgeBg: 'bg-blue-50 dark:bg-blue-900/20',
      badgeText: 'text-blue-600 dark:text-blue-400',
    };
  }
  if (lowerCat.includes('entertainment')) {
    return {
      icon: Film,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-500',
      badgeBg: 'bg-purple-50 dark:bg-purple-900/20',
      badgeText: 'text-purple-600 dark:text-purple-400',
    };
  }
  if (lowerCat.includes('shopping') || lowerCat.includes('tech')) {
    return {
      icon: ShoppingCart,
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-500',
      badgeBg: 'bg-pink-50 dark:bg-pink-900/20',
      badgeText: 'text-pink-600 dark:text-pink-400',
    };
  }
  if (lowerCat.includes('bill') || lowerCat.includes('health')) {
    return {
      icon: Dumbbell,
      iconBg: 'bg-rose-100 dark:bg-rose-900/30',
      iconColor: 'text-rose-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-900/20',
      badgeText: 'text-rose-600 dark:text-rose-400',
    };
  }
  if (lowerCat.includes('salary') || lowerCat.includes('freelance') || lowerCat.includes('investment')) {
    return {
      icon: Banknote,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
    };
  }
  
  return {
    icon: FileText,
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500',
    badgeBg: 'bg-gray-50 dark:bg-gray-800',
    badgeText: 'text-gray-600 dark:text-gray-400',
  };
};

const formatStackedDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return (
    <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
      <span className="font-medium text-gray-900 dark:text-gray-100">{month}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">{day},</span>
      <span>{year}</span>
    </div>
  );
};

const formatInlineDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Transactions() {
  const dispatch = useAppDispatch();
  const { items, searchQuery, filterType, sortBy, sortOrder } = useAppSelector(state => state.transactions);
  const { role } = useAppSelector(state => state.ui);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [focusedTransactionId, setFocusedTransactionId] = useState<string | null>(null);
  const itemsPerPage = 5;

  const handleLocateOnMap = (transactionId: string) => {
    setFocusedTransactionId(transactionId);
    setViewMode('map');
  };

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          comparison = a.amount - b.amount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [items, searchQuery, filterType, sortBy, sortOrder]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(items.map(t => t.category));
    return Array.from(cats).sort();
  }, [items]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  const finalFilteredItems = useMemo(() => {
    return filteredAndSortedItems.filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        matchesDate = new Date(t.date) >= cutoffDate;
      }
      
      return matchesCategory && matchesDate;
    });
  }, [filteredAndSortedItems, selectedCategory, dateRange]);

  const totalPages = Math.ceil(finalFilteredItems.length / itemsPerPage);
  const currentItems = finalFilteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy, sortOrder, selectedCategory, dateRange]);

  const handleExport = (format: 'csv' | 'json') => {
    let dataStr = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      dataStr = JSON.stringify(finalFilteredItems, null, 2);
      mimeType = 'application/json';
      fileName = 'transactions.json';
    } else {
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
      const rows = finalFilteredItems.map(t => [
        t.date, t.description, t.category, t.type, t.amount.toString()
      ]);
      dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
      fileName = 'transactions.csv';
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto space-y-5 sm:space-y-8 px-1 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Transactions</h2>
          {/* List / Map Toggle */}
          <div className="bg-white dark:bg-gray-900 rounded-full p-1 flex shadow-sm border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setViewMode('list')}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors z-10 ${
                viewMode === 'list'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {viewMode === 'list' && (
                <motion.div
                  layoutId="viewmode-toggle"
                  className="absolute inset-0 bg-[#FF6B4A] rounded-full shadow-md shadow-orange-500/20 -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors z-10 ${
                viewMode === 'map'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {viewMode === 'map' && (
                <motion.div
                  layoutId="viewmode-toggle"
                  className="absolute inset-0 bg-[#FF6B4A] rounded-full shadow-md shadow-orange-500/20 -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
          <div className="relative group">
            <button className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
              Export
            </button>
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => handleExport('csv')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">CSV</button>
              <button onClick={() => handleExport('json')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">JSON</button>
            </div>
          </div>
          {role === 'admin' && (
            <button 
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
              className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FF6B4A] to-[#ff8c73] text-white rounded-full text-sm font-medium hover:from-[#ff5733] hover:to-[#ff7a5c] transition-all shadow-lg shadow-orange-500/30"
            >
              <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by merchant, ID, or category..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 w-full overflow-x-auto py-1 hide-scrollbar">
          <div className="relative shrink-0">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-3 sm:pl-5 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm cursor-pointer"
            >
              <option value="all">Category: All</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select 
              value={filterType}
              onChange={(e) => dispatch(setFilterType(e.target.value as any))}
              className="appearance-none pl-3 sm:pl-5 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <ChevronDown className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm cursor-pointer"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="all">All Time</option>
            </select>
            <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#FF6B4A] animate-spin" />
                  <p className="text-sm font-medium text-gray-400">Loading map...</p>
                </div>
              </div>
            }>
              <TransactionMapView
                transactions={finalFilteredItems}
                focusedTransactionId={focusedTransactionId}
                onFocusHandled={() => setFocusedTransactionId(null)}
              />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-6 font-semibold cursor-pointer text-left" onClick={() => dispatch(setSort({ by: 'date', order: sortOrder === 'asc' ? 'desc' : 'asc' }))}>Date</th>
                <th className="px-8 py-6 font-semibold text-left">Description</th>
                <th className="px-8 py-6 font-semibold text-left">Category</th>
                <th className="px-8 py-6 font-semibold text-left">Type</th>
                <th className="px-8 py-6 font-semibold text-right cursor-pointer" onClick={() => dispatch(setSort({ by: 'amount', order: sortOrder === 'asc' ? 'desc' : 'asc' }))}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              <AnimatePresence>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((t) => {
                    const styles = getCategoryStyles(t.category);
                    return (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          {formatStackedDate(t.date)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                              <styles.icon className={`w-6 h-6 ${styles.iconColor}`} />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-base">{t.description}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles.badgeBg} ${styles.badgeText}`}>
                            {t.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-500 dark:text-gray-400 font-medium">
                          {t.type === 'income' ? 'Income' : (t.category.toLowerCase().includes('bill') ? 'Subscription' : 'Purchase')}
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-4">
                            <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                            <div className="flex items-center gap-2 w-auto justify-end">
                              {t.location && (
                                <button
                                  onClick={() => handleLocateOnMap(t.id)}
                                  title="Show on map"
                                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-[#FF6B4A] hover:border-[#FF6B4A]/30 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors bg-white dark:bg-gray-800 shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {role === 'admin' && (
                                <>
                                  <button 
                                    onClick={() => { setEditingTransaction(t.id); setIsModalOpen(true); }}
                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors bg-white dark:bg-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => dispatch(deleteTransaction(t.id))}
                                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors bg-white dark:bg-gray-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {currentItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center text-gray-500 shadow-sm border border-gray-100 dark:border-gray-800">
              No transactions found.
            </div>
          ) : (
            currentItems.map((t) => {
              const styles = getCategoryStyles(t.category);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                      <styles.icon className={`w-5 h-5 ${styles.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badgeBg} ${styles.badgeText}`}>
                          {t.category}
                        </span>
                        <span className="text-xs text-gray-400">{formatInlineDate(t.date)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  </div>
                  {(role === 'admin' || t.location) && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                      {t.location && (
                        <button 
                          onClick={() => handleLocateOnMap(t.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:text-[#FF6B4A] bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Locate
                        </button>
                      )}
                      {role === 'admin' && (
                        <>
                          <button 
                            onClick={() => { setEditingTransaction(t.id); setIsModalOpen(true); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:text-blue-600 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button 
                            onClick={() => dispatch(deleteTransaction(t.id))}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 hover:text-red-600 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 sm:mt-8 pb-4 sm:pb-8">
          {/* Items count */}
          <p className="text-xs font-medium text-gray-400 order-2 sm:order-1">
            Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, finalFilteredItems.length)} of {finalFilteredItems.length}
          </p>

          {/* Pagination controls */}
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers with truncation */}
            {(() => {
              const pages: (number | 'ellipsis')[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                // Always show first page
                pages.push(1);
                if (currentPage > 3) pages.push('ellipsis');
                // Middle range
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (currentPage < totalPages - 2) pages.push('ellipsis');
                // Always show last page
                pages.push(totalPages);
              }

              return pages.map((page, idx) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                      ···
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentPage === page
                        ? 'bg-[#FF6B4A] text-white shadow-lg shadow-orange-500/30 scale-110'
                        : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            transactionId={editingTransaction} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
