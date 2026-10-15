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
      console.log('[checkAuth] called on', location.pathname)
      try {
        
       // const res = await fetch('http://localhost:4000/api/auth/validate', { credentials: 'include' });
        const res = await fetch(ezystaffBEUrl + 'auth/checkAuth', { credentials: 'include' });
        const data = await res.json()
        console.log(data)
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
    console.log("inzio useEffect*****");
    checkAuth()
    console.log("fine useEffect*****");
  }, [location.pathname]) 



  //const location = useLocation();

  console.log("sono in PrivateRoute**: isAuthenticated: " + isAuthenticated);
  console.log("sono in PrivateRoute**: isLoading: " + isLoading);
  console.log("sono in PrivateRoute**: location: " + JSON.stringify(location));

  if (isLoading) {
    return <div>Loading authentication status…</div>;
  }

  const idOperatore = localStorage.getItem('idOperatore');
  const ruolo = localStorage.getItem('ruolo');
  const token = localStorage.getItem('token');

  console.log('idOperatore: ' + idOperatore);
  console.log('ruolo: ' + ruolo);
  console.log('token: ' + token);
   console.log('allowedRole: ' + allowedRole);

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

  
  if (allowedRole === 'OPERATORE' ? ruolo !== 'OPERATORE' : serverHRRole !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }
    

  let HeaderComponent = null;
  if (ruolo === 'OPERATORE') {
    HeaderComponent = HeaderOperatore;
  } else if (allowedRole === 'HR') {
    HeaderComponent = HeaderHR;
  } else if (allowedRole === 'ADMIN') {
    HeaderComponent = Header;
  }

  return (
    <>
      {HeaderComponent && <HeaderComponent />}
      <Outlet />
    </>
  );
};
