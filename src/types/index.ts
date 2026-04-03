export type TransactionType = 'income' | 'expense';

export interface TransactionLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
  location?: TransactionLocation;
}

export type Role = 'admin' | 'viewer';
export type Theme = 'light' | 'dark';

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}
