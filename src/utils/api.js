// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};