import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.trakjobs.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const data = error.response.data;
      if (data?.error_code === 'VERIFICATION_REQUIRED' || data?.message?.includes('must be verified')) {
        const token = localStorage.getItem('employee_token');
        
        // Update local cache
        const employee = JSON.parse(localStorage.getItem('employee_auth_employee') || '{}');
        employee.verification_status = 'pending';
        localStorage.setItem('employee_auth_employee', JSON.stringify(employee));

        const vendorAppUrl = import.meta.env.VITE_VENDOR_APP_URL || 'http://localhost:5173';
        window.location.href = `${vendorAppUrl}/verification?authToken=${token}&role=Employee`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
