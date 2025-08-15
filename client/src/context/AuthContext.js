import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) { logout(); }
        else { setUser(JSON.parse(storedUser)); }
      } catch (error) { logout(); }
    }
    setLoading(false);
  }, []);

  const login = async (role, email, password) => {
    let response;
    if (role === 'school') {
      response = await api.post('/schools/login', { login: email, password });
    } else {
      response = await api.post('/auth/login', { role, email, password });
    }
    
    const tokenData = response.data.data || response.data;
    const { token: newToken } = tokenData;

    // Store token immediately so the next API call is authenticated
    localStorage.setItem('token', newToken);
    setToken(newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // --- DEFINITIVE FIX: Fetch full profile after login ---
    let profileResponse;
    if (role === 'school') {
      profileResponse = await api.get('/schools/profile');
    } else if (role === 'candidate') {
      profileResponse = await api.get('/candidates/profile');
    } else { // admin
      const { user: userDataFromApi } = tokenData;
      profileResponse = { data: { data: userDataFromApi } };
    }
    
    const completeUserData = { ...profileResponse.data.data, role };
    localStorage.setItem('user', JSON.stringify(completeUserData));
    setUser(completeUserData);
    return completeUserData;
  };
  
  const register = async (role, formData) => {
    let endpoint = role === 'candidate' ? '/auth/register' : '/schools/register';
    const payload = role === 'candidate' 
        ? { role, email: formData.email, password: formData.password, fullName: formData.fullName, contact: formData.contactNo, type: formData.type, position: formData.position }
        : formData;
    const response = await api.post(endpoint, payload);
    return response.data.message;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = { user, token, loading, login, register, logout, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading Application...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};