// PrivateRoute.tsx
import {useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
//import { useAuth } from './AuthContext';
import HeaderOperatore from './pages/common/HeaderOperatore';
import Header from './pages/common/Header';
import HeaderHR from './pages/common/HeaderHR';
import { ezystaffBEUrl } from './utils/baseUrl';
import { hrMe } from './utils/hrWorkflow';

interface ProtectedRouteProps {
  allowedRole: 'ADMIN' | 'OPERATORE' | 'HR';
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  //const { isAuthenticated, isLoading } = useAuth();


    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [serverHRRole,setServerHRRole]=useState<string|null>(null);
  //  const [userRole, setUserRole] = useState<'ADMIN' | 'OPERATORE'>();
    const location = useLocation();

    const checkAuth = async () => {
      try {
        
       // const res = await fetch('http://localhost:4000/api/auth/validate', { credentials: 'include' });
        const res = await fetch(ezystaffBEUrl + 'auth/checkAuth', { credentials: 'include' });
        const data = await res.json()
        setIsAuthenticated(data.ok)
        if (data.ok) {
          const identity=await hrMe().catch(()=>null);
          setServerHRRole(identity?.role??null);
        }
       // setUserRole(data.role)


        //setIsAuthenticated(false)
       // setUserRole('ADMIN');

      } catch {
        setIsAuthenticated(false)
      //  setUserRole(undefined)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    checkAuth()
  }, [location.pathname]) 



  //const location = useLocation();


  if (isLoading) {
    return <div>Loading authentication status…</div>;
  }

  const ruolo = localStorage.getItem('ruolo');


  if (!isAuthenticated) {
    localStorage.removeItem('token');
    localStorage.removeItem('ruolo');
    localStorage.removeItem('idOperatore');
    localStorage.removeItem('operatoreLoggato');    

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  
  if (allowedRole === 'OPERATORE' ? ruolo !== 'OPERATORE' : allowedRole === 'ADMIN' ? !(serverHRRole === 'ADMIN' || ruolo === 'ADMIN') : serverHRRole !== 'HR') {
    return <Navigate to="/unauthorized" replace />;
  }
    

  let HeaderComponent = null;
  if (allowedRole === 'HR') {
    // HR access overrides the operator's primary role for navigation.
    HeaderComponent = HeaderHR;
  } else if (allowedRole === 'ADMIN') {
    HeaderComponent = Header;
  } else if (ruolo === 'OPERATORE') {
    HeaderComponent = HeaderOperatore;
  }

  return (
    <>
      {HeaderComponent && <HeaderComponent />}
      <Outlet />
    </>
  );
};
