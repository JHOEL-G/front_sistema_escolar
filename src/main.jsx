import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import keycloak from './features/auth/services/keycloakConfig.js'
import { ImpersonationProvider } from './components/perstectiva/ImpersonationProviderr.jsx'

const root = createRoot(document.getElementById('root'));

const isPublicRoute = window.location.pathname.startsWith('/f/');

keycloak.init({
  onLoad: isPublicRoute ? 'check-sso' : 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256'
}).then((authenticated) => {
  if (authenticated) {
    localStorage.setItem('token', keycloak.token);
  }

  if (authenticated || isPublicRoute) {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <ImpersonationProvider>
            <App />
          </ImpersonationProvider>
        </BrowserRouter>
      </StrictMode>
    );
  }
}).catch((err) => {
  console.error("Error en Keycloak:", err);
  root.render(
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-red-500 font-bold">Error al conectar con el servidor de identidad.</h1>
    </div>
  );
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registrado'))
      .catch(err => console.error('SW error:', err));
  });
}
