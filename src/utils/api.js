// Centralized API configuration
// Uses VITE_API_URL env variable in production, falls back to localhost for dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_BASE = `${API_URL}/api`;
