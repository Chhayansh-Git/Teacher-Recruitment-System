import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  // This points to your backend. Make sure your backend server is running.
  baseURL: 'http://localhost:5000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  This interceptor adds the auth token to every request if it exists,
  automating the authentication process for protected routes.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;