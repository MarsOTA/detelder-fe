import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './presenze-pagination.css'
import './payroll-table.css'
import App from './App.tsx'
import '@mantine/core/styles.css';
//import { AuthProvider } from './AuthContext';
//import { AuthProvider } from './AuthContext.tsx';
import { BrowserRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register';

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

