import axios from 'axios';

// Decide base URL by hostname at runtime
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';

    return isLocal
      ? 'http://localhost:5000/api'
      : 'https://booklib-apuj.onrender.com/api'; // <-- Correct backend URL
  }
  // Fallback (SSR or non-browser)
  return 'http://localhost:5000/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('📥 Response Error:', error.response?.data || error.message);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request');
        case 404:
          throw new Error(data.message || 'Resource not found');
        case 500:
          throw new Error(data.message || 'Internal server error');
        default:
          throw new Error(data.message || `HTTP Error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

class ApiService {
  // Get all books
  async getBooks() {
    try {
      const response = await api.get('/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  // Get single book by ID
  async getBook(id) {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error);
      throw error;
    }
  }

  // Add new book
  async addBook(bookData) {
    try {
      // Validate required fields
      if (!bookData.title || !bookData.author) {
        throw new Error('Title and author are required');
      }

      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  }

  // Update existing book
  async updateBook(id, bookData) {
    try {
      // Validate required fields
      if (!bookData.title || !bookData.author) {
        throw new Error('Title and author are required');
      }

      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book ${id}:`, error);
      throw error;
    }
  }

  // Delete book
  async deleteBook(id) {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book ${id}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;