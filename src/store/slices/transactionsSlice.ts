import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionLocation } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';

// Real-world merchant locations across Indian cities
const MERCHANT_LOCATIONS: Record<string, { merchants: { name: string; location: TransactionLocation }[] }> = {
  Food: {
    merchants: [
      { name: 'Saravana Bhavan', location: { lat: 28.6328, lng: 77.2197, address: 'Connaught Place, Delhi' } },
      { name: 'Bademiya Kebabs', location: { lat: 18.9217, lng: 72.8335, address: 'Colaba, Mumbai' } },
      { name: 'MTR Restaurant', location: { lat: 12.9560, lng: 77.5729, address: 'Lalbagh Road, Bangalore' } },
      { name: 'Sharma Dhaba', location: { lat: 28.6517, lng: 77.2319, address: 'Chandni Chowk, Delhi' } },
      { name: 'Cafe Coffee Day', location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' } },
      { name: 'Haldiram Sweets', location: { lat: 26.9124, lng: 75.7873, address: 'MI Road, Jaipur' } },
    ]
  },
  Transport: {
    merchants: [
      { name: 'Uber Ride', location: { lat: 28.5562, lng: 77.1000, address: 'IGI Airport, Delhi' } },
      { name: 'Ola Auto', location: { lat: 19.0760, lng: 72.8777, address: 'Andheri, Mumbai' } },
      { name: 'Metro Recharge', location: { lat: 28.6435, lng: 77.2139, address: 'Rajiv Chowk Metro, Delhi' } },
      { name: 'Rapido Bike', location: { lat: 17.3850, lng: 78.4867, address: 'Hitech City, Hyderabad' } },
    ]
  },
  Entertainment: {
    merchants: [
      { name: 'PVR Cinemas', location: { lat: 28.5672, lng: 77.3215, address: 'Noida Sector 18' } },
      { name: 'BookMyShow Tickets', location: { lat: 19.1176, lng: 72.9060, address: 'Powai, Mumbai' } },
      { name: 'Smaaash Gaming', location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' } },
    ]
  },
  Shopping: {
    merchants: [
      { name: 'Croma Electronics', location: { lat: 19.0598, lng: 72.8296, address: 'Juhu, Mumbai' } },
      { name: 'Reliance Digital', location: { lat: 28.4595, lng: 77.0266, address: 'Cyber Hub, Gurgaon' } },
      { name: 'Lifestyle Store', location: { lat: 13.0827, lng: 80.2707, address: 'T Nagar, Chennai' } },
      { name: 'DMart Supermart', location: { lat: 18.5204, lng: 73.8567, address: 'Hinjewadi, Pune' } },
    ]
  },
  Bills: {
    merchants: [
      { name: 'Apollo Pharmacy', location: { lat: 17.4401, lng: 78.3489, address: 'Gachibowli, Hyderabad' } },
      { name: 'Airtel Store', location: { lat: 28.6398, lng: 77.0882, address: 'Nehru Place, Delhi' } },
    ]
  },
  Salary: { merchants: [] },
  Freelance: { merchants: [] },
  Investments: { merchants: [] },
};

const generateInitialTransactions = (): Transaction[] => {
  const categories = {
    expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills'],
    income: ['Salary', 'Freelance', 'Investments']
  };

  const transactions: Transaction[] = [];

  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i).toISOString();
    
    const numTransactions = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numTransactions; j++) {
      const isIncome = Math.random() > 0.8;
      const type = isIncome ? 'income' : 'expense';
      const categoryList = categories[type];
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      const amount = isIncome 
        ? Math.floor(Math.random() * 2000) + 500 
        : Math.floor(Math.random() * 200) + 10;

      // Assign a merchant location if available (~65% of expense transactions get GPS)
      let location: TransactionLocation | undefined;
      let description = `${category} ${type}`;

      const merchantList = MERCHANT_LOCATIONS[category]?.merchants || [];
      if (merchantList.length > 0 && Math.random() > 0.35) {
        const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
        location = {
          lat: merchant.location.lat + (Math.random() - 0.5) * 0.005, // slight jitter
          lng: merchant.location.lng + (Math.random() - 0.5) * 0.005,
          address: merchant.location.address,
        };
        description = merchant.name;
      }

      transactions.push({
        id: uuidv4(),
        date,
        amount,
        category,
        type,
        description,
        ...(location ? { location } : {}),
      });
    }
  }

  return transactions.reverse();
};

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('transactions');
    if (serializedState === null) {
      return generateInitialTransactions();
    }
    const parsed = JSON.parse(serializedState);
    // If stored data doesn't have locations, regenerate
    if (parsed.length > 0 && !parsed.some((t: Transaction) => t.location)) {
      return generateInitialTransactions();
    }
    return parsed;
  } catch (err) {
    return generateInitialTransactions();
  }
};

interface TransactionsState {
  items: Transaction[];
  searchQuery: string;
  filterType: 'all' | 'income' | 'expense';
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

const initialState: TransactionsState = {
  items: loadState(),
  searchQuery: '',
  filterType: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id'>>) => {
      const newTransaction = {
        ...action.payload,
        id: uuidv4(),
      };
      state.items.unshift(newTransaction);
      localStorage.setItem('transactions', JSON.stringify(state.items));
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem('transactions', JSON.stringify(state.items));
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      localStorage.setItem('transactions', JSON.stringify(state.items));
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterType: (state, action: PayloadAction<'all' | 'income' | 'expense'>) => {
      state.filterType = action.payload;
    },
    setSort: (state, action: PayloadAction<{ by: 'date' | 'amount', order: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.by;
      state.sortOrder = action.payload.order;
    }
  },
});

export const { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction,
  setSearchQuery,
  setFilterType,
  setSort
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
