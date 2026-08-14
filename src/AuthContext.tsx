// AuthContext.tsx
{/*
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ezystaffBEUrl } from './utils/baseUrl';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userRole?: 'ADMIN' | 'OPERATORE';
    checkAuth: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<'ADMIN' | 'OPERATORE'>();
    const location = useLocation();

    const checkAuth = async () => {
      console.log('[checkAuth] called on', location.pathname)
      try {
        
       // const res = await fetch('http://localhost:4000/api/auth/validate', { credentials: 'include' });
        const res = await fetch(ezystaffBEUrl + 'auth/checkAuth', { credentials: 'include' });
        const data = await res.json()
        console.log(data)
        setIsAuthenticated(data.ok)
       // setUserRole(data.role)


        //setIsAuthenticated(false)
        setUserRole('ADMIN');

      } catch {
        setIsAuthenticated(false)
        setUserRole(undefined)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    checkAuth()
  }, [location.pathname]) 

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, userRole, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
*/}