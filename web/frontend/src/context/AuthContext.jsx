import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { onIdTokenChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

const defaultUser = {
  uid: 'ortho-practitioner-01',
  email: 'doctor@orthocenter.org',
  fullName: 'Orthodontist Practitioner',
  name: 'Orthodontist Practitioner',
  role: 'Orthodontist'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bamp_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bamp_token') || 'bamp-session-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const freshToken = await firebaseUser.getIdToken(true);
          setToken(freshToken);
          localStorage.setItem('bamp_token', freshToken);

          let userDetails = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || 'Orthodontist Practitioner',
            name: firebaseUser.displayName || 'Orthodontist Practitioner',
            role: 'Orthodontist'
          };

          if (db) {
            try {
              const uDoc = await getDoc(doc(db, 'users', firebaseUser.email.toLowerCase()));
              if (uDoc.exists()) {
                userDetails = { ...userDetails, ...uDoc.data() };
              } else {
                const uUidDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (uUidDoc.exists()) {
                  userDetails = { ...userDetails, ...uUidDoc.data() };
                }
              }
            } catch (e) {
              console.warn('[AuthContext] Firestore profile fetch note:', e.message);
            }
          }

          setUser(userDetails);
          localStorage.setItem('bamp_user', JSON.stringify(userDetails));
        } catch (err) {
          console.warn('[AuthContext] Token refresh note:', err.message);
        }
      } else {
        const savedToken = localStorage.getItem('bamp_token');
        if (!savedToken) {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('bamp_user', JSON.stringify(userObj));
    localStorage.setItem('bamp_token', tokenStr);
  };

  const logoutUser = async () => {
    try {
      if (auth) await fbSignOut(auth);
    } catch (_) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('bamp_user');
    localStorage.removeItem('bamp_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        role: user?.role || 'Orthodontist',
        loading,
        loginUser,
        logoutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
