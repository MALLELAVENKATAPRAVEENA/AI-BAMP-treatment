import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bamp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bamp_token'));

  const loginUser = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('bamp_user', JSON.stringify(userObj));
    localStorage.setItem('bamp_token', tokenStr);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bamp_user');
    localStorage.removeItem('bamp_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
