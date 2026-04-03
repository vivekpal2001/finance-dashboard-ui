import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionsSlice';
import uiReducer from './slices/uiSlice';
import goalsReducer from './slices/goalsSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    ui: uiReducer,
    goals: goalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
