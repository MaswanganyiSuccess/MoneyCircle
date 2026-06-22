import axios, { type AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  idNumber: string;
  role: 'borrower' | 'lender';
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response: AxiosResponse = await api.post('/auth/login', credentials);
    const data = response.data;
    if (data.success && data.data) {
      return data;
    }
    throw new Error(data.error || 'Login failed');
  },
  register: async (profileData: RegisterData) => {
    const response: AxiosResponse = await api.post('/auth/register', profileData);
    return response.data;
  },
};

export default api;