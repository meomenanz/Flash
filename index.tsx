
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Фикс для Gun.js: эмулируем глобальные переменные, которых нет в браузере по умолчанию
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
