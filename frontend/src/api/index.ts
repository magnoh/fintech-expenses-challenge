import axios from 'axios';
import { 
  User, Category, Transaction, DashboardData, PaginatedResponse, TransactionType 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token JWT em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com erros globais (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirou ou é inválido, limpa e desloga
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Métodos de API ---

export const authApi = {
  login: async (data: any) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<Omit<User, 'password'>>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

export const categoriesApi = {
  getAll: async () => {
    const res = await api.get<Category[]>('/categories');
    return res.data;
  },
  create: async (data: { name: string; description?: string }) => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },
  update: async (id: string, data: { name?: string; description?: string }) => {
    const res = await api.patch<Category>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionsApi = {
  getAll: async (params: GetTransactionsParams) => {
    const res = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return res.data;
  },
  create: async (data: { description: string; amount: number; type: TransactionType; date: string; categoryId: string }) => {
    const res = await api.post<Transaction>('/transactions', data);
    return res.data;
  },
  update: async (id: string, data: Partial<{ description: string; amount: number; type: TransactionType; date: string; categoryId: string }>) => {
    const res = await api.patch<Transaction>(`/transactions/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    await api.delete(`/transactions/${id}`);
  },
};

export const dashboardApi = {
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get<DashboardData>('/dashboard', { params });
    return res.data;
  },
};

export default api;
