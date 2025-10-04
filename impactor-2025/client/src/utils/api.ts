import axios, { AxiosResponse } from 'axios';
import { NeoData, BrowseResponse } from '@/types';

// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// NEO API functions
export const neoApi = {
  /**
   * Get asteroid data by ID
   */
  async getById(id: string): Promise<NeoData> {
    const response: AxiosResponse<ApiResponse<NeoData>> = await api.get(`/neo/${id}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch asteroid data');
    }
    
    return response.data.data;
  },

  /**
   * Browse asteroids with pagination
   */
  async browse(page: number = 0, size: number = 20): Promise<BrowseResponse> {
    const response: AxiosResponse<ApiResponse<BrowseResponse>> = await api.get('/neo/browse', {
      params: { page, size },
    });
    
    if (!response.data.success) {
      throw new Error('Failed to browse asteroids');
    }
    
    return response.data.data;
  },
};

// Health check
export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string }> = await api.get('/health');
    return response.data;
  },
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.error || error.response.data?.message || 'Server error';
    
    throw new ApiError(message, status);
  } else if (error.request) {
    // Request was made but no response received
    throw new ApiError('Network error - please check your connection', 0);
  } else {
    // Something else happened
    throw new ApiError(error.message || 'Unknown error', 0);
  }
}

export default api;
