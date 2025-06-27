import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Only load swagger CSS in development or when API docs are enabled
if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_API_DOCS === 'true') {
  import('swagger-ui-react/swagger-ui.css');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
