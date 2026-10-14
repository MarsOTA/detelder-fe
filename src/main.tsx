import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@mantine/core/styles.css';
//import { AuthProvider } from './AuthContext';
//import { AuthProvider } from './AuthContext.tsx';
import { BrowserRouter } from 'react-router'

// ✅ Importa e registra il service worker generato dal plugin
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </Fragment>
)

