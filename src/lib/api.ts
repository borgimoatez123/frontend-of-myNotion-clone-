import axios from 'axios';
import { AuthResponse, User, Page, Block, BlockContent, CreatePageRequest, CreateBlockRequest } from '@/types';

// Use the same IP as your frontend is running on
const API_BASE_URL = 'http://192.168.109.1:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Pages API
export const pagesAPI = {
  create: async (data: CreatePageRequest): Promise<{ message: string; page: Page }> => {
    const response = await api.post('/pages', data);
    return response.data;
  },

  getAll: async (): Promise<Page[]> => {
    const response = await api.get('/pages');
    return response.data;
  },

  getById: async (id: string): Promise<Page> => {
    const response = await api.get(`/pages/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePageRequest>): Promise<void> => {
    await api.put(`/pages/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/pages/${id}`);
    return response.data;
  },
};

// Blocks API
export const blocksAPI = {
  create: async (data: CreateBlockRequest): Promise<{ message: string; block: Block }> => {
    const response = await api.post('/blocks', data);
    return response.data;
  },

  getByPageId: async (pageId: string): Promise<Block[]> => {
    const response = await api.get(`/blocks/page/${pageId}`);
    return response.data;
  },

  update: async (id: string, data: { type?: Block['type']; content?: Partial<BlockContent>; order?: number }): Promise<void> => {
    await api.put(`/blocks/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/blocks/${id}`);
    return response.data;
  },
};