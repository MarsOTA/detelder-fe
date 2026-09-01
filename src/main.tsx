import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import './index.css'
import './operatori-filters-fix.css'
import './presenze-pagination.css'
import './payroll-table.css'
import './admin-theme.css'
import './admin-components.css'
import './admin-payroll.css'
import './admin-dark-global.css'
import './admin-dark-final-fixes.css'
import './payroll-dark-final.css'
import './admin-payroll-source-fix.css'
import './planning-filter-pattern.css'
import './gestione-turni-dark.css'
import App from './App.tsx'
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