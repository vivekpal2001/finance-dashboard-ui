import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Role, Theme } from '../../types';

interface UiState {
  theme: Theme;
  role: Role;
  sidebarOpen: boolean;
}

const loadTheme = (): Theme => {
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const initialState: UiState = {
  theme: loadTheme(),
  role: 'admin',
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    }
  },
});

export const { toggleTheme, setRole, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
