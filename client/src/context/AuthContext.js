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

  const authenticateWithToken = async (newToken, role) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    let profileResponse;
    if (role === 'school') {
      profileResponse = await api.get('/schools/profile');
    } else if (role === 'candidate') {
      profileResponse = await api.get('/candidates/profile');
    } else {
      const decoded = jwtDecode(newToken);
      profileResponse = { data: { data: { id: decoded.id, email: decoded.email, role: decoded.role, fullName: decoded.fullName } } };
    }
    const completeUserData = { ...profileResponse.data.data, role };
    localStorage.setItem('user', JSON.stringify(completeUserData));
    setUser(completeUserData);
    return completeUserData;
  };

  const login = async (role, email, password) => {
    let response;
    if (role === 'school') {
      response = await api.post('/schools/login', { login: email, password });
    } else {
      response = await api.post('/auth/login', { role, email, password });
    }
    const { token: newToken } = response.data.data || response.data;
    return authenticateWithToken(newToken, role);
  };
  
  const register = async (role, formData) => {
    let endpoint = '/auth/register';
    let payload = {};

    if (role === 'candidate') {
      endpoint = '/auth/register';
      payload = { 
        role, 
        email: formData.email, 
        password: formData.password, 
        fullName: formData.fullName, 
        contact: formData.contactNo, 
        type: formData.type, 
        position: formData.position 
      };
    } else { // role === 'school'
      endpoint = '/schools/register';
      // --- THIS IS THE FIX ---
      // Build a clean payload with only the fields required for school registration.
      payload = {
        name: formData.name,
        affiliationNo: formData.affiliationNo,
        address: formData.address,
        location: formData.location,
        pincode: formData.pincode,
        contactNo: formData.contactNo,
        email: formData.email,
        strength: Number(formData.strength), // Ensure strength is a number
        schoolUpto: formData.schoolUpto,
        board: formData.board,
        termsAccepted: formData.acceptedTerms,
      };
      // Only include optional fields if they have a value.
      if (formData.whatsappNumber) payload.whatsappNumber = formData.whatsappNumber;
      if (formData.website) payload.website = formData.website;
      if (formData.principalName) payload.principalName = formData.principalName;
      if (formData.directorName) payload.directorName = formData.directorName;
      // ----------------------
    }
    
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

  const value = { user, token, loading, login, register, logout, authenticateWithToken, isAuthenticated: !!user };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading Application...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};