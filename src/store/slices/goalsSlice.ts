import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Goal } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const loadGoals = (): Goal[] => {
  try {
    const serialized = localStorage.getItem('goals');
    if (serialized === null) {
      return [
        {
          id: uuidv4(),
          title: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 4500,
          deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
        },
        {
          id: uuidv4(),
          title: 'Vacation',
          targetAmount: 3000,
          currentAmount: 800,
          deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
        }
      ];
    }
    return JSON.parse(serialized);
  } catch {
    return [];
  }
};

interface GoalsState {
  items: Goal[];
}

const initialState: GoalsState = {
  items: loadGoals(),
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<Omit<Goal, 'id'>>) => {
      state.items.push({ ...action.payload, id: uuidv4() });
      localStorage.setItem('goals', JSON.stringify(state.items));
    },
    updateGoalProgress: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const goal = state.items.find(g => g.id === action.payload.id);
      if (goal) {
        goal.currentAmount += action.payload.amount;
        localStorage.setItem('goals', JSON.stringify(state.items));
      }
    }
  }
});

export const { addGoal, updateGoalProgress } = goalsSlice.actions;
export default goalsSlice.reducer;
