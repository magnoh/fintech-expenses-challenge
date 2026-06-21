export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  userId: string;
  category: Category;
  createdAt: string;
}

export interface DashboardData {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  topCategories: Array<{
    name: string;
    amount: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
