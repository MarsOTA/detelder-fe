import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './operatori-filters-fix.css'
import './admin-theme.css'
import './admin-theme-refine.css'
import './presenze-pagination.css'
import './payroll-table.css'
import './payroll-dark-fix.css'
import App from './App.tsx'
import '@mantine/core/styles.css';
//import { AuthProvider } from './AuthContext';
//import { AuthProvider } from './AuthContext.tsx';
import { BrowserRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register';

if (localStorage.getItem('ruolo') === 'ADMIN' && localStorage.getItem('adminTheme') === 'dark') {
  document.documentElement.classList.add('admin-dark');
  document.documentElement.dataset.adminTheme = 'dark';
}

let isReloadingForUpdate = false;

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (isReloadingForUpdate) return;
    isReloadingForUpdate = true;
    updateSW(true).finally(() => {
      window.location.reload();
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </Fragment>
)
